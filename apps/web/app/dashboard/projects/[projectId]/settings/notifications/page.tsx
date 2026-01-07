'use client';

import { useNotifications } from '@/lib/hooks/use-notifications';
import { useState, use } from 'react';
import { Bell, Slack, Mail, Globe, Trash2, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationsPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = use(params);
    const { channels, isLoading, createChannel, updateChannel, removeChannel } = useNotifications(projectId);
    const [newChannelType, setNewChannelType] = useState<'EMAIL' | 'SLACK' | 'WEBHOOK'>('EMAIL');
    const [newChannelUrl, setNewChannelUrl] = useState('');

    const handleAddChannel = async () => {
        if (!newChannelUrl && newChannelType !== 'EMAIL') {
            toast.error('Please enter a URL');
            return;
        }

        try {
            await createChannel.mutateAsync({
                type: newChannelType,
                config: newChannelType === 'EMAIL' ? { email: newChannelUrl } : { url: newChannelUrl },
                events: ['BACKUP_SUCCESS', 'BACKUP_FAILURE', 'DIFF_READY', 'RESTORE_SUCCESS', 'RESTORE_FAILURE'],
            });
            setNewChannelUrl('');
            toast.success('Notification channel added');
        } catch (error) {
            toast.error('Failed to add notification channel');
        }
    };

    const toggleChannel = async (id: string, isEnabled: boolean) => {
        try {
            await updateChannel.mutateAsync({ id, isEnabled });
            toast.success('Channel updated');
        } catch (error) {
            toast.error('Failed to update channel');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this notification channel?')) return;
        try {
            await removeChannel.mutateAsync(id);
            toast.success('Channel deleted');
        } catch (error) {
            toast.error('Failed to delete channel');
        }
    };

    return (
        <div className="space-y-6 p-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Notification Settings</h1>
                <p className="text-muted-foreground">Configure how you want to be notified of job outcomes.</p>
            </div>

            <div className="grid gap-6">
                <div className="bg-white rounded-xl border p-6 shadow-sm overflow-hidden">
                    <div className="mb-4">
                        <h3 className="font-semibold text-lg text-slate-900">Add New Channel</h3>
                        <p className="text-sm text-muted-foreground">Integrate with Slack, Discord, or receive email alerts.</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-48">
                            <label className="text-sm font-medium mb-1 block">Type</label>
                            <select
                                className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                value={newChannelType}
                                onChange={(e) => setNewChannelType(e.target.value as any)}
                            >
                                <option value="EMAIL">Email</option>
                                <option value="SLACK">Slack</option>
                                <option value="WEBHOOK">Generic Webhook</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="text-sm font-medium mb-1 block">
                                {newChannelType === 'EMAIL' ? 'Email Address' : 'Webhook URL'}
                            </label>
                            <input
                                type="text"
                                placeholder={newChannelType === 'EMAIL' ? 'engineering@company.com' : 'https://hooks.slack.com/services/...'}
                                className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                value={newChannelUrl}
                                onChange={(e) => setNewChannelUrl(e.target.value)}
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleAddChannel}
                                disabled={createChannel.isPending}
                                className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                <Plus className="w-4 h-4" />
                                Add Channel
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4">
                    {isLoading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    ) : (
                        channels.map((channel: any) => (
                            <div key={channel.id} className="bg-white rounded-xl border p-6 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-50 rounded-xl">
                                        {channel.type === 'EMAIL' && <Mail className="w-6 h-6 text-blue-600" />}
                                        {channel.type === 'SLACK' && <Slack className="w-6 h-6 text-blue-600" />}
                                        {channel.type === 'WEBHOOK' && <Globe className="w-6 h-6 text-blue-600" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-900">{channel.type}</span>
                                            <span className="text-sm text-muted-foreground italic truncate max-w-[200px] md:max-w-md">
                                                {channel.type === 'EMAIL' ? channel.config.email : channel.config.url}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Events: {channel.events.slice(0, 3).join(', ')}
                                            {channel.events.length > 3 && ` +${channel.events.length - 3} more`}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-slate-500">Enabled</span>
                                        <button
                                            onClick={() => toggleChannel(channel.id, !channel.isEnabled)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${channel.isEnabled ? 'bg-blue-600' : 'bg-slate-200'}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${channel.isEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                                            />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(channel.id)}
                                        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors border"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                    {!isLoading && channels.length === 0 && (
                        <div className="text-center py-12 p-6 border-2 border-dashed rounded-xl bg-slate-50 text-slate-400">
                            <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No notification channels configured yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
