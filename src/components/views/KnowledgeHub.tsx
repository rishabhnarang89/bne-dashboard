import { useState } from 'react';
import { useValidationData } from '../../hooks/useValidationData';
import type { KnowledgeCard, KnowledgeItem } from '../../hooks/useValidationData';
import {
    Plus, Edit3, Trash2, Link as LinkIcon, FileText,
    Search, Grid, List, Share2, File, FileSpreadsheet, StickyNote
} from 'lucide-react';
import { Modal, useToast } from '../ui';
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
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>

            {/* Header / Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search knowledge base..."
                        className="input"
                        style={{ paddingLeft: '40px', width: '100%' }}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary" style={{ gap: '6px' }}>
                        Filters <span style={{ fontSize: '0.7em' }}>▼</span>
                    </button>
                    <div className="btn-group" style={{ display: 'flex', border: '1px solid var(--border-subtle)', borderRadius: '6px', overflow: 'hidden' }}>
                        <button
                            className={`btn btn-ghost btn-icon ${viewMode === 'grid' ? 'active' : ''}`}
                            style={{ borderRadius: 0, background: viewMode === 'grid' ? 'var(--bg-subtle)' : 'transparent' }}
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            className={`btn btn-ghost btn-icon ${viewMode === 'list' ? 'active' : ''}`}
                            style={{ borderRadius: 0, background: viewMode === 'list' ? 'var(--bg-subtle)' : 'transparent' }}
                            onClick={() => setViewMode('list')}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>

                <button
                    className="btn btn-primary"
                    style={{ background: '#10b981', borderColor: '#10b981', color: 'white' }}
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
                gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                gap: '24px'
            }}>
                {filteredCards.sort((a, b) => a.sortOrder - b.sortOrder).map(card => (
                    <div key={card.id} className="glass-card" style={{
                        display: 'flex', flexDirection: 'column',
                        padding: '0', // Reset padding for custom structure
                        overflow: 'hidden',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        {/* Card Header */}
                        <div style={{
                            padding: '16px',
                            borderBottom: '1px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <div style={{
                                width: '32px', height: '32px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--text-default)'
                            }}>
                                <IconRenderer name={card.icon} size={24} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{card.title}</h3>
                            </div>

                            <span style={{
                                background: '#e0f2fe', color: '#0369a1',
                                padding: '2px 8px', borderRadius: '12px',
                                fontSize: '0.75rem', fontWeight: 600
                            }}>
                                {card.items.length} Resources
                            </span>
                        </div>

                        {/* Card Items */}
                        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {card.items.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                    No items yet
                                </div>
                            ) : (
                                card.items.sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 5).map(item => {
                                    const ItemIcon = getResourceIcon(item.type);
                                    // Hacky color mapping for now
                                    const iconColor = item.type === 'link' ? '#3b82f6' :
                                        item.type === 'google_drive' ? '#10b981' :
                                            item.type === 'note' ? '#f59e0b' : '#ef4444';

                                    const typeLabel = item.type === 'link' ? 'Link' :
                                        item.type === 'google_drive' ? 'Drive' :
                                            item.type === 'note' ? 'Note' : 'File';

                                    return (
                                        <div key={item.id} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            fontSize: '0.9rem'
                                        }}>
                                            <ItemIcon size={16} style={{ color: iconColor, flexShrink: 0 }} />

                                            <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                                <span style={{ fontWeight: 600, color: 'var(--text-default)' }}>{typeLabel}: </span>
                                                <span style={{ color: 'var(--text-secondary)' }}>
                                                    {item.url ? (
                                                        <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} className="hover:underline">
                                                            {item.title}
                                                        </a>
                                                    ) : item.title}
                                                </span>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85em', marginLeft: '4px' }}>({typeLabel})</span>
                                            </div>

                                            {/* Action Menu (Hidden by default, could be hover) */}
                                            <button
                                                className="btn btn-ghost btn-xs btn-icon"
                                                style={{ opacity: 0.5 }}
                                                onClick={() => {
                                                    setActiveCardId(card.id);
                                                    setCurrentItem(item);
                                                    setItemModalOpen(true);
                                                }}
                                            >
                                                <Edit3 size={12} />
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                            {card.items.length > 5 && (
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px' }}>
                                    + {card.items.length - 5} more...
                                </div>
                            )}
                        </div>

                        {/* Card Footer */}
                        <div style={{
                            padding: '12px 16px',
                            borderTop: '1px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'var(--bg-subtle-alt)',
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)'
                        }}>
                            <span>Last updated: Oct 26, 2023</span> {/* Placeholder date */}

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-ghost btn-sm" style={{ height: '28px', padding: '0 8px', gap: '6px' }}>
                                    <Share2 size={14} /> Share
                                </button>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    style={{ height: '28px', padding: '0 8px', gap: '6px' }}
                                    onClick={() => {
                                        setCurrentCard(card);
                                        setCardModalOpen(true);
                                    }}
                                >
                                    <Edit3 size={14} /> Edit
                                </button>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    style={{ height: '28px', padding: '0 8px', gap: '6px' }}
                                    onClick={() => openAddItem(card.id)}
                                >
                                    <Plus size={14} /> Add
                                </button>
                            </div>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        {currentCard.id && (
                            <button
                                className="btn btn-ghost btn-sm"
                                style={{ color: 'var(--danger)' }}
                                onClick={() => handleDeleteCard(currentCard.id!)}
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        )}
                        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                            <button className="btn btn-secondary" onClick={() => setCardModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSaveCard}>Save</button>
                        </div>
                    </div>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        {currentItem.id && activeCardId && (
                            <button
                                className="btn btn-ghost btn-sm"
                                style={{ color: 'var(--danger)' }}
                                onClick={() => handleDeleteItem(currentItem.id!, activeCardId!)}
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        )}
                        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                            <button className="btn btn-secondary" onClick={() => setItemModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSaveItem}>Save</button>
                        </div>
                    </div>
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
