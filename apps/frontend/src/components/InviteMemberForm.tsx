/**
 * InviteMemberForm — modal/form for inviting new team members.
 *
 * Features:
 * - Email + full name + role selection
 * - Role restricted to JUNIOR_CA, SUPPORT_STAFF (CA_OWNER not assignable)
 * - Form validation (required fields)
 * - Loading state during submission
 * - Error display with clear messaging
 *
 * This is CA_OWNER only; hidden from other roles via parent component.
 */

import { useState } from 'react';
import type { InviteMemberDto } from '@botstackhq/shared-types';
import { useInviteMember } from '../hooks/api';
import { useTeamUIStore } from '../stores/team';
import { ASSIGNABLE_ROLES, ROLE_METADATA } from '../types/team';

export function InviteMemberForm() {
  const inviteMember = useInviteMember();
  const { closeInviteModal } = useTeamUIStore();

  const [formData, setFormData] = useState<InviteMemberDto>({
    email: '',
    fullName: '',
    role: 'JUNIOR_CA',
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: InviteMemberDto) => ({
      ...prev,
      [name]: value,
    }));
    setValidationError(null); // Clear validation error on change
  };

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      setValidationError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setValidationError('Please enter a valid email address');
      return false;
    }
    if (!formData.fullName.trim()) {
      setValidationError('Full name is required');
      return false;
    }
    if (!ASSIGNABLE_ROLES.includes(formData.role)) {
      setValidationError('Invalid role selected');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await inviteMember.mutateAsync(formData);
      // Reset form on success
      setFormData({
        email: '',
        fullName: '',
        role: 'JUNIOR_CA',
      });
      closeInviteModal();
    } catch {
      // Error is displayed below
    }
  };

  const errorMessage = validationError || (inviteMember.error ? inviteMember.error.message : null);

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="team@example.com"
            disabled={inviteMember.isPending}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
          />
        </div>

        {/* Full name field */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            disabled={inviteMember.isPending}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
          />
        </div>

        {/* Role selection */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={inviteMember.isPending}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {ASSIGNABLE_ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_METADATA[role].label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">{ROLE_METADATA[formData.role].description}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 justify-end pt-4">
          <button
            type="button"
            onClick={closeInviteModal}
            disabled={inviteMember.isPending}
            className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={inviteMember.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {inviteMember.isPending ? 'Sending invite...' : 'Send Invite'}
          </button>
        </div>
      </form>
    </div>
  );
}
