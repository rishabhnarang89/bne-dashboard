import { useState } from 'react';
import { useValidationData } from '../../hooks/useValidationData';
import type { KnowledgeCard, KnowledgeItem } from '../../hooks/useValidationData';
import {
    Plus, Edit3, Trash2, Link as LinkIcon, FileText,
    Search, Grid, List, File, FileSpreadsheet, StickyNote,
    ExternalLink, FolderOpen
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
        // @ts-ignore
        const IconComponent = Icons[name] || Icons.Folder;
        return <IconComponent size={size} color={color} />;
    };

    // --- Card Handlers ---

    const handleSaveCard = async () => {
        if (!currentCard.title?.trim()) return;

        try {
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
        } catch (error: any) {
            showToast(error.message || 'Failed to save category', 'error');
        }
    };

    const handleDeleteCard = async (id: string) => {
        if (confirm('Are you sure you want to delete this category and all its items?')) {
            try {
                await deleteKnowledgeCard(id);
                showToast('Category deleted', 'success');
                setCardModalOpen(false); // Close modal if open
            } catch (error: any) {
                showToast(error.message || 'Failed to delete category', 'error');
            }
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

        try {
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
        } catch (error: any) {
            showToast(error.message || 'Failed to save item', 'error');
        }
    };

    const handleDeleteItem = async (itemId: string, cardId: string) => {
        if (confirm('Delete this item?')) {
            try {
                await deleteKnowledgeItem(itemId, cardId);
                showToast('Item deleted', 'success');
                setItemModalOpen(false); // Close modal
            } catch (error: any) {
                showToast(error.message || 'Failed to delete item', 'error');
            }
        }
    };

    // --- Renderers ---

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px 60px 20px' }}>

            {/* Header / Toolbar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '32px',
                gap: '16px',
                flexWrap: 'wrap',
                background: 'var(--bg-surface)',
                padding: '16px',
                borderRadius: '16px',
                border: '1px solid var(--border-subtle)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
                <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search resources, links, and files..."
                        className="input"
                        style={{ paddingLeft: '44px', width: '100%', height: '44px', fontSize: '1rem' }}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="btn-group" style={{ display: 'flex', border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden' }}>
                        <button
                            className={`btn btn-ghost btn-icon ${viewMode === 'grid' ? 'active' : ''}`}
                            style={{ borderRadius: 0, height: '44px', width: '44px', background: viewMode === 'grid' ? 'var(--bg-subtle)' : 'transparent' }}
                            onClick={() => setViewMode('grid')}
                            title="Grid View"
                        >
                            <Grid size={20} />
                        </button>
                        <button
                            className={`btn btn-ghost btn-icon ${viewMode === 'list' ? 'active' : ''}`}
                            style={{ borderRadius: 0, height: '44px', width: '44px', background: viewMode === 'list' ? 'var(--bg-subtle)' : 'transparent' }}
                            onClick={() => setViewMode('list')}
                            title="List View"
                        >
                            <List size={20} />
                        </button>
                    </div>

                    <button
                        className="btn btn-primary"
                        style={{
                            background: '#10b981',
                            borderColor: '#10b981',
                            color: 'white',
                            height: '44px',
                            padding: '0 20px',
                            fontWeight: 600,
                            gap: '8px'
                        }}
                        onClick={() => {
                            setCurrentCard({ icon: 'Folder', color: 'blue' });
                            setCardModalOpen(true);
                        }}
                    >
                        <Plus size={20} /> New Category
                    </button>
                </div>
            </div>

            {/* Empty State */}
            {knowledgeCards.length === 0 && (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '80px 20px',
                    textAlign: 'center',
                    background: 'var(--bg-surface)',
                    borderRadius: '16px',
                    border: '2px dashed var(--border-subtle)'
                }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%', background: '#ecfdf5',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px',
                        color: '#10b981'
                    }}>
                        <FolderOpen size={40} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-default)' }}>Knowledge Hub is Empty</h3>
                    <p style={{ maxWidth: '500px', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
                        Create categories to organize your project resources, links, reports, and files.
                        Keep everything in one place for your team.
                    </p>
                    <button
                        className="btn btn-primary"
                        style={{ background: '#10b981', borderColor: '#10b981', color: 'white' }}
                        onClick={() => {
                            setCurrentCard({ icon: 'Folder', color: 'blue' });
                            setCardModalOpen(true);
                        }}
                    >
                        <Plus size={18} /> Create First Category
                    </button>
                </div>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(360px, 1fr))' : '1fr',
                gap: '24px'
            }}>
                {filteredCards.sort((a, b) => a.sortOrder - b.sortOrder).map(card => (
                    <div key={card.id} className="glass-card" style={{
                        display: 'flex', flexDirection: 'column',
                        padding: '0',
                        overflow: 'hidden',
                        transition: 'all 0.2s ease',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '16px',
                        background: 'var(--bg-surface)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
                    }}>
                        {/* Card Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            background: 'var(--bg-active)'
                        }}>
                            <div style={{
                                width: '40px', height: '40px',
                                borderRadius: '10px',
                                background: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--text-default)',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}>
                                <IconRenderer name={card.icon} size={22} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-default)' }}>{card.title}</h3>
                                {card.description && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>{card.description}</div>}
                            </div>

                            <span style={{
                                background: 'white', color: 'var(--text-secondary)',
                                padding: '4px 10px', borderRadius: '20px',
                                fontSize: '0.75rem', fontWeight: 600,
                                border: '1px solid var(--border-subtle)'
                            }}>
                                {card.items.length}
                            </span>
                        </div>

                        {/* Card Items */}
                        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {card.items.length === 0 ? (
                                <div style={{
                                    textAlign: 'center', padding: '30px 20px',
                                    color: 'var(--text-muted)', fontSize: '0.9rem',
                                    background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px dashed var(--border-subtle)'
                                }}>
                                    No resources added yet
                                </div>
                            ) : (
                                card.items
                                    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                                    .map(item => {
                                        const ItemIcon = getResourceIcon(item.type);
                                        // Improved color mapping
                                        const iconColor = item.type === 'link' ? '#3b82f6' :
                                            item.type === 'google_drive' ? '#10b981' :
                                                item.type === 'note' ? '#f59e0b' : '#6b7280';

                                        const iconBg = item.type === 'link' ? '#eff6ff' :
                                            item.type === 'google_drive' ? '#ecfdf5' :
                                                item.type === 'note' ? '#fffbeb' : '#f3f4f6';

                                        return (
                                            <div key={item.id} className="item-row" style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '8px',
                                                borderRadius: '8px',
                                                transition: 'background 0.2s',
                                                cursor: 'pointer'
                                            }}
                                                onClick={() => {
                                                    if (item.url) window.open(item.url, '_blank');
                                                    else {
                                                        setActiveCardId(card.id);
                                                        setCurrentItem(item);
                                                        setItemModalOpen(true);
                                                    }
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <div style={{
                                                    width: '32px', height: '32px',
                                                    borderRadius: '8px',
                                                    background: iconBg,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: iconColor,
                                                    flexShrink: 0
                                                }}>
                                                    <ItemIcon size={16} />
                                                </div>

                                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                                    <div style={{ fontWeight: 600, color: 'var(--text-default)', fontSize: '0.95rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                                        {item.title}
                                                    </div>
                                                    {item.content && (
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                                            {item.content}
                                                        </div>
                                                    )}
                                                </div>

                                                <div onClick={e => e.stopPropagation()}>
                                                    <button
                                                        className="btn btn-ghost btn-xs btn-icon"
                                                        style={{ color: 'var(--text-muted)' }}
                                                        onClick={() => {
                                                            setActiveCardId(card.id);
                                                            setCurrentItem(item);
                                                            setItemModalOpen(true);
                                                        }}
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                            )}
                        </div>

                        {/* Card Footer */}
                        <div style={{
                            padding: '16px 20px',
                            borderTop: '1px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'var(--bg-subtle-alt)',
                        }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {card.items.length > 0 ? 'Updated recently' : 'New category'}
                            </div>

                            <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    style={{ height: '32px', padding: '0 10px', gap: '6px', fontSize: '0.85rem' }}
                                    onClick={() => {
                                        setCurrentCard(card);
                                        setCardModalOpen(true);
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn btn-sm"
                                    style={{
                                        height: '32px', padding: '0 12px', gap: '6px', fontSize: '0.85rem',
                                        background: 'white', border: '1px solid var(--border-subtle)',
                                        color: 'var(--text-default)', fontWeight: 500,
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                    }}
                                    onClick={() => openAddItem(card.id)}
                                >
                                    <Plus size={14} /> Add Resource
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
                closeOnOutsideClick={false}
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
                            <button className="btn btn-primary" onClick={handleSaveCard}>{currentCard.id ? "Update" : "Create"}</button>
                        </div>
                    </div>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                        <label className="label">Title</label>
                        <input
                            className="input"
                            value={currentCard.title || ''}
                            onChange={e => setCurrentCard({ ...currentCard, title: e.target.value })}
                            placeholder="e.g., Marketing Assets"
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">Description (Optional)</label>
                        <input
                            className="input"
                            value={currentCard.description || ''}
                            onChange={e => setCurrentCard({ ...currentCard, description: e.target.value })}
                            placeholder="Brief description of this collection"
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="label">Icon (Lucide Name)</label>
                            <input className="input" value={currentCard.icon || ''} onChange={e => setCurrentCard({ ...currentCard, icon: e.target.value })} placeholder="Folder, Book, ..." />
                            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>e.g. Users, FileText, Globe</small>
                        </div>
                        <div className="form-group">
                            <label className="label">Color Tag</label>
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
                title={currentItem.id ? "Edit Resource" : "Add Resource"}
                closeOnOutsideClick={false}
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
                        <label className="label">Resource Type</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {[
                                { id: 'link', label: 'Web Link', icon: LinkIcon },
                                { id: 'google_drive', label: 'Google Drive', icon: FileSpreadsheet },
                                { id: 'note', label: 'Note / Text', icon: StickyNote },
                                { id: 'file', label: 'Local File', icon: FileText },
                            ].map(type => (
                                <div
                                    key={type.id}
                                    onClick={() => setCurrentItem({ ...currentItem, type: type.id as any })}
                                    style={{
                                        padding: '10px',
                                        border: `1px solid ${currentItem.type === type.id ? 'var(--primary)' : 'var(--border-subtle)'}`,
                                        background: currentItem.type === type.id ? 'var(--bg-active)' : 'white',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        fontSize: '0.9rem', fontWeight: 500
                                    }}
                                >
                                    <type.icon size={16} color={currentItem.type === type.id ? 'var(--primary)' : 'var(--text-muted)'} />
                                    {type.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Title</label>
                        <input className="input" value={currentItem.title || ''} onChange={e => setCurrentItem({ ...currentItem, title: e.target.value })} placeholder="Resource title..." autoFocus />
                    </div>

                    {currentItem.type !== 'note' && (
                        <div className="form-group">
                            <label className="label">URL / Link</label>
                            <div style={{ position: 'relative' }}>
                                <ExternalLink size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    className="input"
                                    style={{ paddingLeft: '36px' }}
                                    value={currentItem.url || ''}
                                    onChange={e => setCurrentItem({ ...currentItem, url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="label">Notes (Optional)</label>
                        <textarea
                            className="textarea"
                            rows={3}
                            value={currentItem.content || ''}
                            onChange={e => setCurrentItem({ ...currentItem, content: e.target.value })}
                            placeholder="Add any additional details or context..."
                        />
                    </div>
                </div>
            </Modal >
        </div >
    );
};
