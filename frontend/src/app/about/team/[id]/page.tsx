import Link from 'next/link';

interface TeamMember {
  id: number;
  employee?: number | null;
  employee_id?: number | null;
  employee_name?: string | null;
  name: string;
  display_name?: string;
  role_title: string;
  bio: string;
  photo: string;
  photo_url: string;
  display_order: number;
  is_active: boolean;
  employee_details?: {
    id: number;
    full_name: string;
    phone: string;
    email: string | null;
    department: string | null;
    job_title: string | null;
    employee_photo: string | null;
  } | null;
}

async function getTeamMember(id: string): Promise<TeamMember | null> {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/content/core-pages/team-members/${id}/`);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Error fetching team member:', error);
    return null;
  }
}

export default async function TeamMemberProfilePage({ params }: { params: { id: string } }) {
  const member = await getTeamMember(params.id);

  if (!member) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
        backgroundAttachment: 'fixed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '48px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <h1 style={{ fontSize: '32px', marginBottom: '16px', color: '#1e293b' }}>Team Member Not Found</h1>
          <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '24px' }}>
            Sorry, we couldn't find the team member you're looking for.
          </p>
          <Link
            href="/about"
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              background: '#1e63b8',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              transition: 'background 0.2s'
            }}
          >
            Back to About Us
          </Link>
        </div>
      </div>
    );
  }

  const displayName = member.display_name || member.name || member.employee_name || 'Team Member';
  const displayPhoto = member.photo_url || (member.employee_details?.employee_photo ? `http://127.0.0.1:8000${member.employee_details.employee_photo}` : null);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
      backgroundAttachment: 'fixed'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            href="/"
            style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1e63b8',
              textDecoration: 'none',
              letterSpacing: '-0.5px'
            }}
          >
            Spencer Water Services
          </Link>
        </div>
        <nav style={{ display: 'flex', gap: '24px' }}>
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Home</Link>
          <Link href="/about" style={{ color: '#1e63b8', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>About</Link>
          <Link href="/services" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Services</Link>
          <Link href="/projects" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Projects</Link>
          <Link href="/contact" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Contact</Link>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ padding: '48px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '32px' }}>
          <Link
            href="/about"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#64748b',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            ← Back to About Us
          </Link>
        </div>

        {/* Profile Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '48px',
            padding: '48px',
          }}>
            {/* Photo Section */}
            <div style={{ textAlign: 'center' }}>
              {displayPhoto ? (
                <img
                  src={displayPhoto}
                  alt={displayName}
                  style={{
                    width: '320px',
                    height: '320px',
                    objectFit: 'cover',
                    borderRadius: '50%',
                    border: '6px solid #f1f5f9',
                    marginBottom: '24px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              ) : (
                <div style={{
                  width: '320px',
                  height: '320px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: '80px',
                  color: '#1e63b8',
                  fontWeight: '700',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  {displayName.charAt(0)}
                </div>
              )}
              <h1 style={{ fontSize: '36px', marginBottom: '8px', color: '#1e293b', fontWeight: '700' }}>{displayName}</h1>
              <p style={{ fontSize: '20px', color: '#64748b', marginBottom: '16px', fontWeight: '500' }}>{member.role_title}</p>
              {member.employee_details?.department && (
                <div style={{
                  display: 'inline-block',
                  padding: '6px 16px',
                  background: '#e0f2fe',
                  color: '#0369a1',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {member.employee_details.department}
                </div>
              )}
            </div>

            {/* Details Section */}
            <div>
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#1e293b', fontWeight: '600' }}>About</h2>
                {member.bio ? (
                  <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#475569' }}>
                    {member.bio}
                  </p>
                ) : (
                  <p style={{ fontSize: '16px', color: '#94a3b8', fontStyle: 'italic' }}>
                    No biography available.
                  </p>
                )}
              </div>

              {member.employee_details && (
                <div style={{
                  padding: '24px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#1e293b', fontWeight: '600' }}>Contact Information</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {member.employee_details.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: '#dbeafe',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px'
                        }}>
                          📞
                        </div>
                        <a
                          href={`tel:${member.employee_details.phone}`}
                          style={{ color: '#1e63b8', textDecoration: 'none', fontWeight: '500', fontSize: '15px' }}
                        >
                          {member.employee_details.phone}
                        </a>
                      </div>
                    )}
                    {member.employee_details.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: '#dbeafe',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px'
                        }}>
                          ✉️
                        </div>
                        <a
                          href={`mailto:${member.employee_details.email}`}
                          style={{ color: '#1e63b8', textDecoration: 'none', fontWeight: '500', fontSize: '15px' }}
                        >
                          {member.employee_details.email}
                        </a>
                      </div>
                    )}
                    {member.employee_details.job_title && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: '#dbeafe',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px'
                        }}>
                          💼
                        </div>
                        <span style={{ color: '#475569', fontWeight: '500', fontSize: '15px' }}>{member.employee_details.job_title}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
