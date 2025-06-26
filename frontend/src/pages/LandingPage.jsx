import React, { useState } from 'react';

// Import your images here (replace with your own images)
import heroImg from './assets/Apartment.jpeg';
import oneBhkImg from './assets/IMG_1173.jpg';
import twoBhkImg from './assets/IMG_4572.jpg';

const apartments = [
    { type: '1BHK', img: oneBhkImg, desc: 'Ideal for couples or small families.' },
    { type: '2BHK', img: twoBhkImg, desc: 'Spacious living for families.' }
];

const features = [
    { icon: '🛡️', title: '24/7 Security', desc: 'Secure premises with CCTV and guards.' },
    { icon: '🚗', title: 'Parking', desc: 'Ample parking for residents and guests.' },
    { icon: '🏊‍♂️', title: 'Swimming Pool', desc: 'Modern pool for relaxation.' },
    { icon: '🏋️‍♂️', title: 'Gym', desc: 'Fully-equipped fitness center.' },
    { icon: '🌳', title: 'Green Spaces', desc: 'Landscaped gardens and parks.' },
];

function LandingPage() {
    const [idx, setIdx] = useState(0);
    const prev = () => setIdx((idx - 1 + apartments.length) % apartments.length);
    const next = () => setIdx((idx + 1) % apartments.length);

    return (
        <div style={{ background: '#f3f4f6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            {/* Header */}
            <header style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '24px 48px', background: '#f8fafc'
            }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#2563eb' }}>
                    Casamia Apartment
                </div>
                <button
                    style={{
                        background: '#2563eb', color: 'white', padding: '8px 24px',
                        border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer'
                    }}
                    onClick={() => window.location = '/login'}
                >
                    Login
                </button>
            </header>

            {/* Hero Section */}
            <section style={{
                width: '100%', height: '340px', background: '#e5e7eb',
                display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}>
                <img
                    src={heroImg}
                    alt="Main Apartment"
                    style={{ maxHeight: '320px', borderRadius: '18px', boxShadow: '0 4px 32px #0003' }}
                />
            </section>

            {/* Apartment Types Slider */}
            <section style={{
                margin: '40px auto', maxWidth: 600, background: 'white', borderRadius: 16,
                boxShadow: '0 2px 12px #0002', padding: 24, textAlign: 'center'
            }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Apartment Types</h2>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <button onClick={prev} style={{
                        background: 'none', border: 'none', fontSize: 32, cursor: 'pointer', color: '#2563eb', marginRight: 12
                    }}>&lt;</button>
                    <div>
                        <img src={apartments[idx].img} alt={apartments[idx].type}
                            style={{ width: 300, height: 180, objectFit: 'cover', borderRadius: 10, marginBottom: 10 }} />
                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{apartments[idx].type}</div>
                        <div style={{ color: '#6b7280', marginTop: 4 }}>{apartments[idx].desc}</div>
                    </div>
                    <button onClick={next} style={{
                        background: 'none', border: 'none', fontSize: 32, cursor: 'pointer', color: '#2563eb', marginLeft: 12
                    }}>&gt;</button>
                </div>
            </section>

            {/* Features Section */}
            <section style={{
                margin: '40px auto', maxWidth: 900, background: '#f9fafb', borderRadius: 16,
                boxShadow: '0 2px 12px #0001', padding: 32
            }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 24, textAlign: 'center' }}>Features</h2>
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24
                }}>
                    {features.map(f => (
                        <div key={f.title} style={{
                            background: 'white', borderRadius: 12, padding: 20, textAlign: 'center',
                            boxShadow: '0 1px 6px #0001'
                        }}>
                            <div style={{ fontSize: 38 }}>{f.icon}</div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: '8px 0' }}>{f.title}</div>
                            <div style={{ color: '#6b7280', fontSize: '0.95rem' }}>{f.desc}</div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default LandingPage;
