import React, { useState, useEffect } from 'react';
import {
  Award, Trophy, Star, ShieldCheck, Sparkles, TrendingUp,
  CheckCircle2, Users, FileText, HelpCircle, Flame, ArrowUpRight
} from 'lucide-react';
import { campusConnectStore } from '../../services/campusConnectStore';

export default function LeadershipScoreboardSection({ account }) {
  const [leaderboard, setLeaderboard] = useState([]);

  const loadData = () => {
    const list = campusConnectStore.getLeaderboard();
    setLeaderboard(list);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('campus_connect_updated', handleUpdate);
    return () => window.removeEventListener('campus_connect_updated', handleUpdate);
  }, []);

  const userRecord = leaderboard.find(
    s => s.studentName === (account?.name || 'Rakesh Das') || s.rollNumber === (account?.registrationNumber || '2305201001')
  ) || leaderboard[3];

  const recentAchievements = [
    {
      id: 'ach-1',
      student: 'Rahul Sharma',
      text: 'Earned +10 Points for faculty-verified Data Structures AVL Tree Rotations notes.',
      time: '12 mins ago',
      badge: '🏆 +10 PTS'
    },
    {
      id: 'ach-2',
      student: 'Priya Das',
      text: 'Earned +10 Points for DBMS 3NF Decomposition lecture notes verified by Prof. R. K. Sahoo.',
      time: '2 hours ago',
      badge: '🏆 +10 PTS'
    },
    {
      id: 'ach-3',
      student: 'Sneha Mishra',
      text: 'Awarded "Peer Lifesaver" badge for answering 5 consecutive missed class requests.',
      time: 'Yesterday',
      badge: '⭐ BADGE'
    },
    {
      id: 'ach-4',
      student: 'Rakesh Das',
      text: 'Earned +10 Points for uploading verified Operating Systems CPU scheduling algorithm solution sheet.',
      time: '2 days ago',
      badge: '🏆 +10 PTS'
    }
  ];

  return (
    <div style={{ background: '#0b0f19', borderRadius: 16, padding: '24px', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #eab308, #ca8a04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 800 }}>
            <Trophy size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Academic Leadership Scoreboard</h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
              Recognizing student academic contributors who share verified notes, fulfill class requests, and support peer learning.
            </p>
          </div>
        </div>

        {/* User's Current Score Card */}
        {userRecord && (
          <div style={{ background: 'linear-gradient(135deg, #1e293b, #192438)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 12, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div>
              <span style={{ fontSize: '0.68rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Your Contribution Standing</span>
              <h4 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>{userRecord.studentName}</h4>
            </div>
            <div style={{ textAlign: 'right', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 14 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#eab308' }}>{userRecord.points} pts</span>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>Rank #{userRecord.rank}</p>
            </div>
          </div>
        )}
      </div>

      {/* Grid: 3 Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        <div style={{ background: '#131c2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>How to Earn Points</span>
            <Sparkles size={16} color="#eab308" />
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.45 }}>
            <strong>+10 pts:</strong> Upload notes verified by faculty<br />
            <strong>+5 pts:</strong> Answer missed class academic request<br />
            <strong>+5 pts:</strong> Share approved previous year question paper
          </p>
        </div>

        <div style={{ background: '#131c2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total Verified Uploads</span>
            <ShieldCheck size={16} color="#34d399" />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#34d399' }}>22 Notes</h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>Across CSE Semester 5 courses this term</p>
        </div>

        <div style={{ background: '#131c2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Academic Recognition</span>
            <Award size={16} color="#a855f7" />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#c084fc' }}>Annual Certificate</h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>Top 5 contributors receive Dean’s Commendation</p>
        </div>
      </div>

      {/* Main 2-column layout: Top Leaderboard Table & Recent Achievements Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 20 }}>
        {/* Leaderboard Table */}
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Trophy size={16} color="#eab308" /> Top Student Contributors (Autumn 2026)
            </h4>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Updated Real-Time</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                  <th style={{ padding: '10px 14px', width: 60, textAlign: 'center' }}>Rank</th>
                  <th style={{ padding: '10px 14px' }}>Student Contributor</th>
                  <th style={{ padding: '10px 14px' }}>Badge</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Verified Notes</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Total Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((s) => (
                  <tr
                    key={s.rollNumber}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      background: s.rank === 1 ? 'rgba(234, 179, 8, 0.05)' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      {s.rank === 1 ? (
                        <span style={{ fontSize: '1.1rem' }}>🥇</span>
                      ) : s.rank === 2 ? (
                        <span style={{ fontSize: '1.1rem' }}>🥈</span>
                      ) : s.rank === 3 ? (
                        <span style={{ fontSize: '1.1rem' }}>🥉</span>
                      ) : (
                        <strong style={{ color: '#94a3b8' }}>#{s.rank}</strong>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1.2rem' }}>{s.avatar || '👨‍🎓'}</span>
                        <div>
                          <strong style={{ color: '#fff', display: 'block' }}>{s.studentName}</strong>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{s.rollNumber} • {s.department}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        background: `${s.badgeColor}20`,
                        border: `1px solid ${s.badgeColor}40`,
                        color: s.badgeColor,
                        padding: '3px 8px',
                        borderRadius: 12,
                        fontSize: '0.72rem',
                        fontWeight: 700
                      }}>
                        {s.badge}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span style={{ color: '#34d399', fontWeight: 700 }}>{s.verifiedUploads}</span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <strong style={{ fontSize: '0.95rem', color: '#eab308' }}>{s.points} pts</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Achievements & Recognition Ticker */}
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 18px', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame size={16} color="#f97316" /> Recent Recognition Feed
            </h4>
          </div>

          <div style={{ padding: '14px', display: 'flex', flexGrow: 1, flexDirection: 'column', gap: 10 }}>
            {recentAchievements.map((ach) => (
              <div
                key={ach.id}
                style={{
                  background: '#182235',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '0.8rem', color: '#38bdf8' }}>{ach.student}</strong>
                  <span style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#fbbf24', fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', borderRadius: 4 }}>
                    {ach.badge}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.76rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                  {ach.text}
                </p>
                <span style={{ fontSize: '0.66rem', color: '#64748b', marginTop: 2 }}>{ach.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
