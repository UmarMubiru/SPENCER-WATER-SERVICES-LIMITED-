$(function(){

$('#inventoryTable').DataTable({

responsive:true,

pageLength:10,

lengthChange:false,

language:{

searchPlaceholder:"Search inventory..."

}

});

$('#requestTable').DataTable({

responsive:true,

pageLength:10,

lengthChange:false,

language:{

searchPlaceholder:"Search requests..."

}

});

});