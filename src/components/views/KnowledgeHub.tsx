import { useState } from 'react';
import { useValidationData } from '../../hooks/useValidationData';
import type { KnowledgeCard, KnowledgeItem } from '../../hooks/useValidationData';
import {
    Plus, Edit3, Trash2, Link as LinkIcon, FileText,
    Search, Grid, List, Share2, File, FileSpreadsheet, StickyNote
} from 'lucide-react';
import { InfoBlock, Modal, useToast } from '../ui';
import * as Icons from 'lucide-react';

export const KnowledgeHub = () => {
    const {
        knowledgeCards, addKnowledgeCard, updateKnowledgeCard, deleteKnowledgeCard,
        addKnowledgeItem, updateKnowledgeItem, deleteKnowledgeItem
    } = useValidationData();
    const { showToast } = useToast();

    // UI state
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [cardModalOpen, setCardModalOpen] = useState(false);
    const [itemModalOpen, setItemModalOpen] = useState(false);
    const [currentCard, setCurrentCard] = useState<Partial<KnowledgeCard>>({});
    const [currentItem, setCurrentItem] = useState<Partial<KnowledgeItem>>({});
    const [activeCardId, setActiveCardId] = useState<string | null>(null);

    // Filter cards based on search
    const filteredCards = knowledgeCards.filter(card =>
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.items.some(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Helpers
    const getResourceColor = (type: string) => {
        switch (type) {
            case 'link': return 'text-blue-500';
            case 'google_drive': return 'text-green-500';
            case 'file': return 'text-red-500'; // PDF usually red, generic file maybe gray
            case 'note': return 'text-yellow-500';
            default: return 'text-gray-500';
        }
    };

    const getResourceIcon = (type: string) => {
        switch (type) {
            case 'link': return LinkIcon;
            case 'google_drive': return FileSpreadsheet; // Approx for Sheets/Docs
            case 'file': return FileText;
            case 'note': return StickyNote;
            default: return File;
        }
    };

    // Dynamic Icon Renderer for Card Header
    const IconRenderer = ({ name, size = 20, color = 'currentColor' }: { name: string, size?: number, color?: string }) => {
        const IconComponent = (Icons as any)[name] || Icons.Folder;
        return <IconComponent size={size} color={color} />;
    };

    // --- Card Handlers ---

    const handleSaveCard = async () => {
        if (!currentCard.title?.trim()) return;

        if (currentCard.id) {
            await updateKnowledgeCard(currentCard.id, {
                title: currentCard.title,
                description: currentCard.description,
                icon: currentCard.icon,
                color: currentCard.color,
                sortOrder: currentCard.sortOrder
            });
            showToast('Category updated', 'success');
        } else {
            await addKnowledgeCard({
                id: `card_${Date.now()}`,
                title: currentCard.title,
                description: currentCard.description,
                icon: currentCard.icon || 'Folder',
                color: currentCard.color || 'blue',
                sortOrder: knowledgeCards.length
            });
            showToast('Category created', 'success');
        }
        setCardModalOpen(false);
    };

    const handleDeleteCard = async (id: string) => {
        if (confirm('Are you sure you want to delete this category and all its items?')) {
            await deleteKnowledgeCard(id);
            showToast('Category deleted', 'success');
        }
    };

    // --- Item Handlers ---

    const openAddItem = (cardId: string) => {
        setActiveCardId(cardId);
        setCurrentItem({
            type: 'link',
            sortOrder: knowledgeCards.find(c => c.id === cardId)?.items.length || 0
        });
        setItemModalOpen(true);
    };

    const handleSaveItem = async () => {
        if (!currentItem.title?.trim() || !activeCardId) return;

        if (currentItem.id) {
            await updateKnowledgeItem(currentItem.id, activeCardId, {
                title: currentItem.title,
                type: currentItem.type,
                url: currentItem.url,
                content: currentItem.content
            });
            showToast('Item updated', 'success');
        } else {
            await addKnowledgeItem({
                id: `item_${Date.now()}`,
                cardId: activeCardId,
                type: currentItem.type || 'link',
                title: currentItem.title,
                url: currentItem.url,
                content: currentItem.content,
                sortOrder: currentItem.sortOrder || 0
            });
            showToast('Item added', 'success');
        }
        setItemModalOpen(false);
    };

    const handleDeleteItem = async (itemId: string, cardId: string) => {
        if (confirm('Delete this item?')) {
            await deleteKnowledgeItem(itemId, cardId);
            showToast('Item deleted', 'success');
        }
    };

    // --- Renderers ---

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <InfoBlock
                    icon={<LayoutGrid size={20} />}
                    title="Knowledge Hub"
                    description="Central repository for project resources, links, and files."
                    variant="info"
                />
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setCurrentCard({ icon: 'Folder', color: 'blue' });
                        setCardModalOpen(true);
                    }}
                >
                    <Plus size={18} /> New Category
                </button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '24px'
            }}>
                {knowledgeCards.sort((a, b) => a.sortOrder - b.sortOrder).map(card => (
                    <div key={card.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        {/* Card Header */}
                        <div style={{
                            padding: '16px',
                            borderBottom: '1px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: `var(--bg-elevated)`
                        }}>
                            <div style={{
                                width: '32px', height: '32px',
                                borderRadius: '8px',
                                background: `var(--${card.color || 'blue'}-light, #eff6ff)`,
                                color: `var(--${card.color || 'blue'}, #3b82f6)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <IconRenderer name={card.icon} size={18} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{card.title}</h3>
                                {card.description && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{card.description}</p>}
                            </div>
                            <div className="dropdown" style={{ position: 'relative' }}>
                                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => {
                                    setCurrentCard(card);
                                    setCardModalOpen(true);
                                }}>
                                    <Edit3 size={14} />
                                </button>
                                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleDeleteCard(card.id)} style={{ color: 'var(--danger)' }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Card Items */}
                        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {card.items.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                    No items yet
                                </div>
                            ) : (
                                card.items.sort((a, b) => a.sortOrder - b.sortOrder).map(item => (
                                    <div key={item.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        background: 'var(--bg-subtle)',
                                        border: '1px solid var(--border-subtle)'
                                    }}>
                                        {/* Icon based on type */}
                                        {item.type === 'link' && <LinkIcon size={14} className="text-muted" />}
                                        {item.type === 'file' && <FileText size={14} className="text-muted" />}
                                        {item.type === 'note' && <FileText size={14} className="text-muted" />}
                                        {item.type === 'google_drive' && <Image size={14} className="text-muted" />}

                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            {item.url ? (
                                                <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontWeight: 500, color: 'var(--primary)', textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {item.title}
                                                </a>
                                            ) : (
                                                <div style={{ fontWeight: 500 }}>{item.title}</div>
                                            )}
                                            {item.content && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.content}</div>}
                                        </div>

                                        <div style={{ display: 'flex' }}>
                                            <button className="btn btn-ghost btn-xs btn-icon" onClick={() => {
                                                setActiveCardId(card.id);
                                                setCurrentItem(item);
                                                setItemModalOpen(true);
                                            }}>
                                                <Edit3 size={12} />
                                            </button>
                                            <button className="btn btn-ghost btn-xs btn-icon" onClick={() => handleDeleteItem(item.id, card.id)}>
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Card Footer */}
                        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)' }}>
                            <button
                                className="btn btn-ghost btn-sm"
                                style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
                                onClick={() => openAddItem(card.id)}
                            >
                                <Plus size={14} /> Add Resource
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- Modals --- */}

            {/* Category Modal */}
            <Modal
                isOpen={cardModalOpen}
                onClose={() => setCardModalOpen(false)}
                title={currentCard.id ? "Edit Category" : "New Category"}
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setCardModalOpen(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSaveCard}>Save</button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                        <label className="label">Title</label>
                        <input className="input" value={currentCard.title || ''} onChange={e => setCurrentCard({ ...currentCard, title: e.target.value })} autoFocus />
                    </div>
                    <div className="form-group">
                        <label className="label">Description</label>
                        <input className="input" value={currentCard.description || ''} onChange={e => setCurrentCard({ ...currentCard, description: e.target.value })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="label">Icon (Lucide Name)</label>
                            <input className="input" value={currentCard.icon || ''} onChange={e => setCurrentCard({ ...currentCard, icon: e.target.value })} placeholder="Folder, Book, ..." />
                        </div>
                        <div className="form-group">
                            <label className="label">Color</label>
                            <select className="input" value={currentCard.color || 'blue'} onChange={e => setCurrentCard({ ...currentCard, color: e.target.value })}>
                                <option value="blue">Blue</option>
                                <option value="green">Green</option>
                                <option value="purple">Purple</option>
                                <option value="orange">Orange</option>
                                <option value="red">Red</option>
                                <option value="gray">Gray</option>
                            </select>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Item Modal */}
            <Modal
                isOpen={itemModalOpen}
                onClose={() => setItemModalOpen(false)}
                title={currentItem.id ? "Edit Item" : "New Item"}
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setItemModalOpen(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSaveItem}>Save</button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                        <label className="label">Type</label>
                        <select className="input" value={currentItem.type || 'link'} onChange={e => setCurrentItem({ ...currentItem, type: e.target.value as any })}>
                            <option value="link">Link / URL</option>
                            <option value="google_drive">Google Drive File</option>
                            <option value="file">File (local)</option>
                            <option value="note">Note / Text</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="label">Title</label>
                        <input className="input" value={currentItem.title || ''} onChange={e => setCurrentItem({ ...currentItem, title: e.target.value })} autoFocus />
                    </div>

                    {currentItem.type !== 'note' && (
                        <div className="form-group">
                            <label className="label">URL / Link</label>
                            <input className="input" value={currentItem.url || ''} onChange={e => setCurrentItem({ ...currentItem, url: e.target.value })} placeholder="https://..." />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="label">Notes / Description</label>
                        <textarea className="textarea" rows={3} value={currentItem.content || ''} onChange={e => setCurrentItem({ ...currentItem, content: e.target.value })} />
                    </div>
                </div>
            </Modal>
        </div>
    );
};
