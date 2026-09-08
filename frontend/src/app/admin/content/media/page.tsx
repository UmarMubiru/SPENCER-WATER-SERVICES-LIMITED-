'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { FileImage, FileText, FolderOpen, Image as ImageIcon, Upload, Trash2, Search, Filter, X, Edit2, FolderPlus, ChevronLeft, ChevronRight, ZoomIn, Download } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import PageHeader from '../../../../components/admin/ui/PageHeader';

type Asset = { id: string | number; url: string; name: string; kind: string; folder: string; alt_text: string; caption: string; project?: string; project_id?: number | null; created_at: string; source?: string };
type Folder = { id: string; name: string; created_at: string };
const API = 'http://127.0.0.1:8000/api/content/media/';

export default function MediaPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery');
  const [currentFolder, setCurrentFolder] = useState<string>('all');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [lightboxImage, setLightboxImage] = useState<Asset | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editForm, setEditForm] = useState({ alt_text: '', caption: '', folder: '' });
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [librarySelection, setLibrarySelection] = useState<Set<string>>(new Set());

  const load = () => {
    setLoading(true);
    fetch(API).then(r => r.json()).then(d => {
      console.log('Media library response:', d);
      setAssets(d.assets || []);
      setFolders(d.folders || []);
    }).catch((error) => {
      console.error('Failed to load media library:', error);
      setAssets([]);
      setFolders([]);
    }).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const loadFolders = async () => {
    try {
      const response = await fetch(`${API}folders/`);
      if (response.ok) {
        const data = await response.json();
        setFolders(data.folders || []);
      }
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  };

  useEffect(() => {
    loadFolders();
  }, []);

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const response = await fetch(`${API}folders/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName.trim() }),
      });
      if (response.ok) {
        setNewFolderName('');
        setShowFolderModal(false);
        loadFolders();
        load();
      } else {
        alert('Failed to create folder');
      }
    } catch (error) {
      alert('Failed to create folder');
    }
  };

  const deleteFolder = async (folderName: string) => {
    if (!confirm('Are you sure you want to delete this folder? Images in it will be moved to General Media.')) return;
    try {
      const folder = folders.find(f => f.name === folderName);
      if (!folder) return;
      const response = await fetch(`${API}folders/${folder.id}/`, { method: 'DELETE' });
      if (response.ok) {
        loadFolders();
        load();
        if (currentFolder === folderName) setCurrentFolder('all');
      } else {
        alert('Failed to delete folder');
      }
    } catch (error) {
      alert('Failed to delete folder');
    }
  };
  
  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const body = new FormData();
      body.append('file', file);
      body.append('kind', file.type.startsWith('image/') ? 'IMAGE' : file.type.startsWith('video/') ? 'VIDEO' : 'DOCUMENT');
      body.append('alt_text', file.name.replace(/[-_]/g, ' ').replace(/\.[^.]+$/, ''));
      if (currentFolder !== 'all') {
        body.append('folder', currentFolder);
      }
      try {
        const r = await fetch(API, { method: 'POST', body });
        const data = await r.json();
        console.log(`Upload ${i + 1}/${files.length} response:`, data);
        if (r.ok) {
          successCount++;
        } else {
          console.error(`Upload ${i + 1}/${files.length} failed:`, data);
          failCount++;
        }
      } catch (error) {
        console.error(`Upload ${i + 1}/${files.length} error:`, error);
        failCount++;
      }
    }
    
    console.log(`Upload complete: ${successCount} succeeded, ${failCount} failed`);
    load();
    setUploading(false);
    event.target.value = '';
    
    if (failCount > 0) {
      alert(`Upload complete: ${successCount} succeeded, ${failCount} failed`);
    }
  };

  const toggleSelection = (id: string | number) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(String(id))) {
      newSelected.delete(String(id));
    } else {
      newSelected.add(String(id));
    }
    setSelectedImages(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const clearSelection = () => {
    setSelectedImages(new Set());
    setShowBulkActions(false);
  };

  const bulkDelete = async () => {
    if (selectedImages.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedImages.size} selected images?`)) return;
    
    let successCount = 0;
    for (const id of selectedImages) {
      // Skip project images that can't be deleted
      if (id.startsWith('activity-') || id.startsWith('document-')) continue;
      
      try {
        const response = await fetch(`${API}${id}/`, { method: 'DELETE' });
        if (response.ok) successCount++;
      } catch (error) {
        console.error(`Failed to delete asset ${id}:`, error);
      }
    }
    
    clearSelection();
    load();
    alert(`Deleted ${successCount} of ${selectedImages.size} selected images.`);
  };

  const bulkMoveToFolder = async (folderName: string) => {
    if (selectedImages.size === 0) return;
    
    let successCount = 0;
    for (const id of selectedImages) {
      // Skip project images
      if (id.startsWith('activity-') || id.startsWith('document-')) continue;
      
      try {
        const response = await fetch(`${API}${id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folder: folderName }),
        });
        if (response.ok) successCount++;
      } catch (error) {
        console.error(`Failed to move asset ${id}:`, error);
      }
    }
    
    clearSelection();
    load();
    alert(`Moved ${successCount} of ${selectedImages.size} selected images to ${folderName || 'General Media'}.`);
  };

  const addToFolderFromLibrary = async () => {
    if (librarySelection.size === 0) return;
    
    let successCount = 0;
    for (const id of librarySelection) {
      // Skip project images
      if (id.startsWith('activity-') || id.startsWith('document-')) continue;
      
      try {
        const response = await fetch(`${API}${id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folder: currentFolder === 'all' ? '' : currentFolder }),
        });
        if (response.ok) successCount++;
      } catch (error) {
        console.error(`Failed to add asset ${id} to folder:`, error);
      }
    }
    
    setLibrarySelection(new Set());
    setShowLibraryModal(false);
    load();
    alert(`Added ${successCount} of ${librarySelection.size} selected images to ${currentFolder === 'all' ? 'General Media' : currentFolder}.`);
  };

  const toggleLibrarySelection = (id: string | number) => {
    const newSelection = new Set(librarySelection);
    if (newSelection.has(String(id))) {
      newSelection.delete(String(id));
    } else {
      newSelection.add(String(id));
    }
    setLibrarySelection(newSelection);
  };

  const deleteAsset = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this media file?')) return;
    // Only MediaAsset can be deleted, not project images
    if (typeof id === 'string' && (id.startsWith('activity-') || id.startsWith('document-'))) {
      alert('Project images cannot be deleted from the media library. Delete them from the project management instead.');
      return;
    }
    const r = await fetch(`${API}${id}/`, { method: 'DELETE' });
    if (r.ok) load();
    else alert('Failed to delete media file.');
  };

  const updateAsset = async () => {
    if (!editingAsset) return;
    try {
      const response = await fetch(`${API}${editingAsset.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (response.ok) {
        setEditingAsset(null);
        load();
      } else {
        alert('Failed to update media file');
      }
    } catch (error) {
      alert('Failed to update media file');
    }
  };

  const openLightbox = (asset: Asset, index: number) => {
    setLightboxImage(asset);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    const visibleAssets = getVisibleAssets();
    let newIndex = direction === 'next' ? lightboxIndex + 1 : lightboxIndex - 1;
    if (newIndex < 0) newIndex = visibleAssets.length - 1;
    if (newIndex >= visibleAssets.length) newIndex = 0;
    setLightboxIndex(newIndex);
    setLightboxImage(visibleAssets[newIndex]);
  };

  const openEditModal = (asset: Asset) => {
    setEditingAsset(asset);
    setEditForm({
      alt_text: asset.alt_text || '',
      caption: asset.caption || '',
      folder: asset.folder || '',
    });
  };

  const getVisibleAssets = () => {
    return assets.filter(a => {
      const matchesFilter = filter === 'ALL' || a.kind === filter;
      const matchesSearch = searchQuery === '' ||
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.project?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.alt_text.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFolder = currentFolder === 'all' || a.folder === currentFolder;
      return matchesFilter && matchesSearch && matchesFolder;
    });
  };

  const visible = getVisibleAssets();

  const groupedByFolder = visible.reduce((acc, asset) => {
    const folder = asset.folder || 'General Media';
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(asset);
    return acc;
  }, {} as Record<string, Asset[]>);

  return (
    <AdminLayout
      title="Media library"
      subtitle="Upload once, use across pages, services, blogs and projects"
      activePath="/admin/content/media"
    >
      <div className="min-h-[calc(100vh-4rem)] space-y-8 p-8 max-w-6xl mx-auto">
        {/* Header with Upload and Folder Management */}
        <section className="flex flex-col justify-between gap-4 rounded-xl border border-blue-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600"><FolderOpen size={23}/></div>
            <div>
              <h2 className="font-semibold text-blue-900">{assets.length} media files</h2>
              <p className="text-sm text-blue-400">Organized in {folders.length + 1} folders</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFolderModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-900 hover:bg-blue-50"
            >
              <FolderPlus size={16}/>New Folder
            </button>
            <button
              onClick={() => setShowLibraryModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-900 hover:bg-blue-50"
            >
              <ImageIcon size={16}/>Add from Library
            </button>
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
              <Upload size={16}/>{uploading ? 'Uploading…' : 'Upload files (multiple)'}
              <input disabled={uploading} onChange={upload} className="hidden" type="file" accept="image/*,video/*,.pdf,.doc,.docx" multiple/>
            </label>
          </div>
        </section>

        {/* Folder Navigation */}
        <section className="flex flex-wrap gap-2 rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
          <button
            onClick={() => setCurrentFolder('all')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${currentFolder === 'all' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-900 hover:bg-blue-100'}`}
          >
            <FolderOpen size={16}/>All Files
          </button>
          {folders.map(folder => (
            <div key={folder.id} className="flex items-center gap-1">
              <button
                onClick={() => setCurrentFolder(folder.name)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${currentFolder === folder.name ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-900 hover:bg-blue-100'}`}
              >
                <FolderOpen size={16}/>{folder.name}
              </button>
              <button
                onClick={() => deleteFolder(folder.name)}
                className="p-2 text-blue-400 hover:text-blue-600"
                title="Delete folder"
              >
                <X size={14}/>
              </button>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-4 rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              {['ALL', 'IMAGE', 'VIDEO', 'DOCUMENT'].map(kind => (
                <button key={kind} onClick={() => setFilter(kind)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filter === kind ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 ring-1 ring-blue-200'}`}>
                  {kind === 'ALL' ? 'All files' : `${kind[0]}${kind.slice(1).toLowerCase()}s`}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                <Search size={16} className="text-blue-400"/>
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-transparent text-sm outline-none" placeholder="Search files..."/>
              </label>
            </div>
          </div>
        </section>

      {loading ? (
        <p className="py-16 text-center text-blue-400">Loading media library…</p>
      ) : visible.length === 0 ? (
        <p className="py-16 text-center text-blue-400">No media files found</p>
      ) : (
        <div className="space-y-6">
          {currentFolder === 'all' ? (
            Object.entries(groupedByFolder).map(([folderName, folderAssets]) => (
              <section key={folderName} className="rounded-xl border border-blue-100 bg-white shadow-sm">
                <div className="border-b border-blue-100 px-5 py-3">
                  <h3 className="font-semibold text-blue-900">{folderName}</h3>
                  <p className="text-xs text-blue-400">{folderAssets.length} files</p>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                    {folderAssets.map((asset: Asset, index: number) => (
                      <article key={asset.id} className="group relative overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm transition-all hover:shadow-md">
                        <div 
                          className="grid aspect-[4/3] place-items-center bg-blue-50 cursor-pointer"
                          onClick={() => asset.kind === 'IMAGE' && openLightbox(asset, index)}
                        >
                          {asset.kind === 'IMAGE' ? (
                            <>
                              <img src={asset.url} alt={asset.alt_text} className="h-full w-full object-cover"/>
                              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                                <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24}/>
                              </div>
                            </>
                          ) : asset.kind === 'DOCUMENT' ? (
                            <FileText size={34} className="text-blue-400"/>
                          ) : (
                            <FileImage size={34} className="text-blue-400"/>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="truncate text-sm font-semibold text-blue-900">{asset.name}</p>
                          {asset.project && (
                            <p className="mt-1 text-xs text-blue-400">{asset.project}</p>
                          )}
                          {asset.source && (
                            <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
                              {asset.source}
                            </span>
                          )}
                        </div>
                        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button onClick={() => openEditModal(asset)} className="rounded-md bg-white p-1.5 text-blue-600 shadow-md hover:bg-blue-50" title="Edit">
                            <Edit2 size={14}/>
                          </button>
                          {typeof asset.id === 'number' && (
                            <button onClick={() => deleteAsset(asset.id)} className="rounded-md bg-white p-1.5 text-blue-600 shadow-md hover:bg-blue-50" title="Delete">
                              <Trash2 size={14}/>
                            </button>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            ))
          ) : (
            <section className="rounded-xl border border-blue-100 bg-white shadow-sm">
              <div className="p-5">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {visible.map((asset: Asset, index: number) => (
                    <article key={asset.id} className="group relative overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm transition-all hover:shadow-md">
                      <div 
                        className="grid aspect-[4/3] place-items-center bg-blue-50 cursor-pointer"
                        onClick={() => asset.kind === 'IMAGE' && openLightbox(asset, index)}
                      >
                        {asset.kind === 'IMAGE' ? (
                          <>
                            <img src={asset.url} alt={asset.alt_text} className="h-full w-full object-cover"/>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24}/>
                            </div>
                          </>
                        ) : asset.kind === 'DOCUMENT' ? (
                          <FileText size={34} className="text-blue-400"/>
                        ) : (
                          <FileImage size={34} className="text-blue-400"/>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="truncate text-sm font-semibold text-blue-900">{asset.name}</p>
                        {asset.project && (
                          <p className="mt-1 text-xs text-blue-400">{asset.project}</p>
                        )}
                        {asset.source && (
                          <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
                            {asset.source}
                          </span>
                        )}
                      </div>
                      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button onClick={() => openEditModal(asset)} className="rounded-md bg-white p-1.5 text-blue-600 shadow-md hover:bg-blue-50" title="Edit">
                          <Edit2 size={14}/>
                        </button>
                        {typeof asset.id === 'number' && (
                          <button onClick={() => deleteAsset(asset.id)} className="rounded-md bg-white p-1.5 text-blue-600 shadow-md hover:bg-blue-50" title="Delete">
                            <Trash2 size={14}/>
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {showBulkActions && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl border border-blue-100 bg-white px-6 py-4 shadow-lg z-40">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-blue-900">{selectedImages.size} image{selectedImages.size !== 1 ? 's' : ''} selected</span>
            <button onClick={clearSelection} className="rounded-lg px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50">
              Clear selection
            </button>
            <div className="h-6 w-px bg-blue-200"></div>
            <select
              onChange={(e) => bulkMoveToFolder(e.target.value)}
              className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm text-blue-900"
              defaultValue=""
            >
              <option value="">Move to folder...</option>
              <option value="">General Media</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.name}>{folder.name}</option>
              ))}
            </select>
            <button
              onClick={bulkDelete}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={closeLightbox}>
          <button
            onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
          >
            <ChevronLeft size={32}/>
          </button>
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImage.url} alt={lightboxImage.alt_text} className="max-h-[90vh] max-w-[90vw] object-contain"/>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <p className="text-white font-medium">{lightboxImage.name}</p>
              {lightboxImage.alt_text && <p className="text-white/70 text-sm">{lightboxImage.alt_text}</p>}
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
          >
            <ChevronRight size={32}/>
          </button>
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
          >
            <X size={24}/>
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditingAsset(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-blue-100">
              <h3 className="text-lg font-semibold text-blue-900">Edit Media</h3>
              <button onClick={() => setEditingAsset(null)} className="text-blue-400 hover:text-blue-600">
                <X size={20}/>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Alt Text</label>
                <input
                  type="text"
                  value={editForm.alt_text}
                  onChange={(e) => setEditForm({ ...editForm, alt_text: e.target.value })}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Alternative text for accessibility"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Caption</label>
                <textarea
                  value={editForm.caption}
                  onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Image caption"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Folder</label>
                <select
                  value={editForm.folder}
                  onChange={(e) => setEditForm({ ...editForm, folder: e.target.value })}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">General Media</option>
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-blue-100">
              <button
                onClick={() => setEditingAsset(null)}
                className="px-4 py-2 text-blue-900 hover:bg-blue-50 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={updateAsset}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowFolderModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-blue-100">
              <h3 className="text-lg font-semibold text-blue-900">Create New Folder</h3>
              <button onClick={() => setShowFolderModal(false)} className="text-blue-400 hover:text-blue-600">
                <X size={20}/>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Folder Name</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Project Photos"
                  onKeyPress={(e) => e.key === 'Enter' && createFolder()}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-blue-100">
              <button
                onClick={() => setShowFolderModal(false)}
                className="px-4 py-2 text-blue-900 hover:bg-blue-50 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={createFolder}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Library Selection Modal */}
      {showLibraryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowLibraryModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-blue-100">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Select from Media Library</h3>
                <p className="text-sm text-blue-400">Select images to add to {currentFolder === 'all' ? 'General Media' : currentFolder}</p>
              </div>
              <button onClick={() => setShowLibraryModal(false)} className="text-blue-400 hover:text-blue-600">
                <X size={20}/>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {assets.filter(a => a.kind === 'IMAGE').map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => toggleLibrarySelection(asset.id)}
                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      librarySelection.has(String(asset.id)) ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-200 hover:border-blue-300'
                    }`}
                  >
                    <img src={asset.url} alt={asset.alt_text} className="w-full h-full object-cover"/>
                    {librarySelection.has(String(asset.id)) && (
                      <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-white text-xs truncate">{asset.name}</p>
                    </div>
                  </div>
                ))}
              </div>
              {assets.filter(a => a.kind === 'IMAGE').length === 0 && (
                <p className="text-center text-blue-400 py-8">No images in the media library</p>
              )}
            </div>
            <div className="flex items-center justify-between p-4 border-t border-blue-100">
              <span className="text-sm text-blue-900">{librarySelection.size} image{librarySelection.size !== 1 ? 's' : ''} selected</span>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLibraryModal(false)}
                  className="px-4 py-2 text-blue-900 hover:bg-blue-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={addToFolderFromLibrary}
                  disabled={librarySelection.size === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-200 disabled:cursor-not-allowed"
                >
                  Add Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </AdminLayout>
  );
}
