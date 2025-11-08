import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Copy, Check, Mail, Clock, X } from 'lucide-react';

export default function Team() {
  const { businessId } = useParams();
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('staff');
  const [loading, setLoading] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);

  const load = async () => {
    const [membersRes, invitationsRes] = await Promise.all([
      apiClient.listMemberships({ business: businessId }).catch(() => []),
      apiClient.listInvitations({ business: businessId }).catch(() => [])
    ]);
    setMembers(membersRes?.results || membersRes || []);
    setInvitations(invitationsRes?.results || invitationsRes || []);
  };

  useEffect(() => {
    load();
  }, [businessId]);

  const invite = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const result = await apiClient.createInvitation({ business: Number(businessId), email, role_in_business: role });
      setEmail('');
      await load();
      alert('Invitation created! Copy the link below to share.');
    } catch (e) {
      alert(e.message || 'Invite failed');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = (token) => {
    const link = `${window.location.origin}/accept-invitation/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const getInviteLink = (token) => {
    return `${window.location.origin}/accept-invitation/${token}`;
  };

  const changeRole = async (membershipId, role_in_business) => {
    try {
      await apiClient.updateMembership(membershipId, { role_in_business });
      await load();
    } catch (e) {
      alert(e.message || 'Update failed');
    }
  };

  const remove = async (membershipId) => {
    if (!confirm('Remove member?')) return;
    try {
      await apiClient.deleteMembership(membershipId);
      await load();
    } catch (e) {
      alert(e.message || 'Remove failed');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invite Member</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 items-center">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded px-3 py-2 flex-1"
            />
            <select value={role} onChange={(e) => setRole(e.target.value)} className="border rounded px-3 py-2">
              <option value="staff">Staff</option>
              <option value="viewer">Viewer</option>
            </select>
            <Button onClick={invite} disabled={loading || !email}>Send Invite</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y border rounded">
            {members.map((m) => (
              <div key={m.id} className="p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{m.user?.username || m.user?.email}</div>
                  <div className="text-xs text-gray-500">{m.business?.legal_name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={m.role_in_business}
                    onChange={(e) => changeRole(m.id, e.target.value)}
                  >
                    <option value="business_admin">Business Admin</option>
                    <option value="staff">Staff</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <Button variant="outline" onClick={() => remove(m.id)}>Remove</Button>
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-500">No team members yet.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invitations List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y border rounded">
            {invitations.filter(inv => inv.status === 'pending').map((inv) => (
              <div key={inv.id} className="p-3 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-sm">{inv.email}</span>
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                      {inv.role_in_business}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Expires: {new Date(inv.expires_at).toLocaleDateString()}
                  </div>
                  {inv.token && (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={getInviteLink(inv.token)}
                        className="text-xs border rounded px-2 py-1 flex-1 bg-gray-50"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyInviteLink(inv.token)}
                        className="text-xs"
                      >
                        {copiedToken === inv.token ? (
                          <>
                            <Check className="w-3 h-3 mr-1" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1" /> Copy Link
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    inv.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    inv.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    inv.status === 'expired' ? 'bg-gray-100 text-gray-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
            {invitations.filter(inv => inv.status === 'pending').length === 0 && (
              <div className="p-6 text-center text-sm text-gray-500">No pending invitations.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}





