from django.db import transaction, models
from django.utils import timezone
from projects.models_extras import ProjectFundTransaction, ProjectResourceAllocation, ProjectCostLine


class FundService:
    """Service for managing project fund transactions and accountability"""
    
    @staticmethod
    @transaction.atomic
    def create_transaction(project, transaction_data, created_by):
        """
        Create a new fund transaction.
        
        transaction_data should contain:
        - activity_id (optional)
        - resource_allocation_id (optional)
        - expense_type
        - description
        - amount
        - transaction_date
        - supplier_or_payee (optional)
        - reference_number (optional)
        - notes (optional)
        """
        # Get resource allocation if provided
        resource_allocation = None
        if transaction_data.get('resource_allocation_id'):
            resource_allocation = ProjectResourceAllocation.objects.filter(
                id=transaction_data['resource_allocation_id'],
                project=project,
                resource_type='money'
            ).first()
            
            if not resource_allocation:
                raise ValueError("Invalid or non-money resource allocation.")
        
        # Check if amount exceeds remaining allocation
        if resource_allocation:
            remaining = resource_allocation.remaining_amount
            if remaining is not None and transaction_data['amount'] > remaining:
                raise ValueError(
                    f"Cannot spend {transaction_data['amount']}. Only {remaining} remaining in allocation."
                )
        
        transaction = ProjectFundTransaction.objects.create(
            project=project,
            activity_id=transaction_data.get('activity_id'),
            resource_allocation=resource_allocation,
            expense_type=transaction_data['expense_type'],
            description=transaction_data['description'],
            amount=transaction_data['amount'],
            spent_by=created_by,
            transaction_date=transaction_data['transaction_date'],
            supplier_or_payee=transaction_data.get('supplier_or_payee', ''),
            reference_number=transaction_data.get('reference_number', ''),
            status=ProjectFundTransaction.Status.PENDING,
            notes=transaction_data.get('notes', ''),
        )
        
        return transaction
    
    @staticmethod
    @transaction.atomic
    def approve_transaction(transaction_id, approved_by):
        """Approve a pending fund transaction"""
        transaction = ProjectFundTransaction.objects.select_for_update().get(pk=transaction_id)
        
        if transaction.status != ProjectFundTransaction.Status.PENDING:
            raise ValueError("Only pending transactions can be approved.")
        
        # Check if amount exceeds remaining allocation
        if transaction.resource_allocation:
            remaining = transaction.resource_allocation.remaining_amount
            if remaining is not None and transaction.amount > remaining:
                raise ValueError(
                    f"Cannot approve {transaction.amount}. Only {remaining} remaining in allocation."
                )
        
        transaction.status = ProjectFundTransaction.Status.APPROVED
        transaction.save(update_fields=["status"])
        
        return transaction
    
    @staticmethod
    @transaction.atomic
    def reject_transaction(transaction_id, rejected_by, reason=''):
        """Reject a pending or approved fund transaction"""
        transaction = ProjectFundTransaction.objects.get(pk=transaction_id)
        
        if transaction.status not in [ProjectFundTransaction.Status.PENDING, ProjectFundTransaction.Status.APPROVED]:
            raise ValueError("Only pending or approved transactions can be rejected.")
        
        transaction.status = ProjectFundTransaction.Status.REJECTED
        transaction.notes = f"{transaction.notes}\n\nRejection reason: {reason}" if reason else transaction.notes
        transaction.save(update_fields=["status", "notes"])
        
        return transaction
    
    @staticmethod
    @transaction.atomic
    def post_transaction(transaction_id, posted_by):
        """
        Post a transaction to project costs.
        This creates a ProjectCostLine and updates the transaction status to POSTED.
        """
        transaction = ProjectFundTransaction.objects.select_for_update().get(pk=transaction_id)
        
        if transaction.status != ProjectFundTransaction.Status.APPROVED:
            raise ValueError("Only approved transactions can be posted.")

        if not transaction.receipt_or_document:
            raise ValueError("Upload a receipt, mobile-money confirmation, or bank-transfer proof before posting this transaction.")
        
        # Check if amount exceeds remaining allocation
        if transaction.resource_allocation:
            remaining = transaction.resource_allocation.remaining_amount
            if remaining is not None and transaction.amount > remaining:
                raise ValueError(
                    f"Cannot post {transaction.amount}. Only {remaining} remaining in allocation."
                )
        
        # Create project cost line
        source_mapping = {
            'TOOL_HIRE': 'TOOL_HIRE',
            'TRANSPORT': 'OTHER',
            'FUEL': 'OTHER',
            'ACCOMMODATION': 'OTHER',
            'MATERIALS': 'MATERIAL_ISSUANCE',
            'LABOUR': 'LABOUR',
            'EQUIPMENT': 'OTHER',
            'OTHER': 'OTHER',
        }
        
        ProjectCostLine.objects.create(
            project=transaction.project,
            source=source_mapping.get(transaction.expense_type, 'OTHER'),
            description=f"{transaction.expense_type}: {transaction.description}",
            amount=transaction.amount,
        )
        
        transaction.status = ProjectFundTransaction.Status.POSTED
        transaction.save(update_fields=["status"])
        
        return transaction
    
    @staticmethod
    @transaction.atomic
    def cancel_transaction(transaction_id, cancelled_by, reason=''):
        """Cancel a pending transaction"""
        transaction = ProjectFundTransaction.objects.get(pk=transaction_id)
        
        if transaction.status != ProjectFundTransaction.Status.PENDING:
            raise ValueError("Only pending transactions can be cancelled.")
        
        transaction.status = ProjectFundTransaction.Status.CANCELLED
        transaction.notes = f"{transaction.notes}\n\nCancellation reason: {reason}" if reason else transaction.notes
        transaction.save(update_fields=["status", "notes"])
        
        return transaction
    
    @staticmethod
    def get_project_fund_summary(project):
        """Get fund summary for a project"""
        allocations = ProjectResourceAllocation.objects.filter(
            project=project,
            resource_type='money'
        )
        
        # The signed contract value is the project's funding ceiling.  Resource
        # allocations are budget envelopes within it, not additional income.
        contract_value = project.contract_value or 0
        working_budget_allocated = sum(allocation.money_amount or 0 for allocation in allocations)
        
        # Sum posted transactions
        used_amount = ProjectFundTransaction.objects.filter(
            project=project,
            status=ProjectFundTransaction.Status.POSTED
        ).aggregate(total_used=models.Sum('amount'))['total_used'] or 0
        
        remaining_amount = contract_value - used_amount
        
        # Sum pending transactions
        pending_amount = ProjectFundTransaction.objects.filter(
            project=project,
            status=ProjectFundTransaction.Status.PENDING
        ).aggregate(total_pending=models.Sum('amount'))['total_pending'] or 0
        
        return {
            "total_allocated": contract_value,
            "contract_value": contract_value,
            "working_budget_allocated": working_budget_allocated,
            "unallocated_amount": contract_value - working_budget_allocated,
            "used_amount": used_amount,
            "remaining_amount": remaining_amount,
            "pending_amount": pending_amount,
        }
