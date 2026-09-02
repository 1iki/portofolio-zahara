import React, { useState, useEffect } from 'react';
import { Plus, Sliders, Edit, Trash2, Layers, Filter, CheckCircle2 } from 'lucide-react';
import {
  getWorkCategories,
  createWorkCategory,
  updateWorkCategory,
  deleteWorkCategory,
  getExperienceCategories,
  createExperienceCategory,
  updateExperienceCategory,
  deleteExperienceCategory,
  getRoleFilters,
  createRoleFilter,
  updateRoleFilter,
  deleteRoleFilter,
  getWorks,
  getExperience,
  subscribeToDataChanges,
} from '../../lib/contentService';
import CategoryEditorModal from '../../components/manage/CategoryEditorModal';
import RoleFilterEditorModal from '../../components/manage/RoleFilterEditorModal';
import DeleteConfirmModal from '../../components/manage/DeleteConfirmModal';
import Toast from '../../components/manage/Toast';

export default function ManageConfigs() {
  const [activeTab, setActiveTab] = useState('workCategories'); // 'workCategories' | 'expCategories' | 'roleFilters'

  // Data states
  const [workCats, setWorkCats] = useState([]);
  const [expCats, setExpCats] = useState([]);
  const [roleFilters, setRoleFilters] = useState([]);
  const [worksList, setWorksList] = useState([]);
  const [expList, setExpList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryType, setCategoryType] = useState('work'); // 'work' | 'exp'
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  const [editingFilter, setEditingFilter] = useState(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [deletingItem, setDeletingItem] = useState(null); // { type: 'workCat'|'expCat'|'roleFilter', item: obj }
  const [toast, setToast] = useState(null);

  const loadAllConfigs = async () => {
    setLoading(true);
    try {
      const [wc, ec, rf, w, e] = await Promise.all([
        getWorkCategories(),
        getExperienceCategories(),
        getRoleFilters(),
        getWorks(),
        getExperience(),
      ]);
      setWorkCats(Array.isArray(wc) ? wc : []);
      setExpCats(Array.isArray(ec) ? ec : []);
      setRoleFilters(Array.isArray(rf) ? rf : []);
      setWorksList(Array.isArray(w) ? w : []);
      setExpList(Array.isArray(e) ? e : []);
    } catch (err) {
      setToast({ type: 'error', message: 'Gagal memuat data konfigurasi.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllConfigs();
    const unsubscribe = subscribeToDataChanges(() => {
      loadAllConfigs();
    });
    return unsubscribe;
  }, []);

  // Save handlers
  const handleSaveCategory = async (data) => {
    if (categoryType === 'work') {
      if (editingCategory) {
        await updateWorkCategory(editingCategory.id, data);
        setToast({ type: 'success', message: `Kategori karya "${data.label}" berhasil diperbarui.` });
      } else {
        await createWorkCategory(data);
        setToast({ type: 'success', message: `Kategori karya "${data.label}" berhasil ditambahkan.` });
      }
    } else {
      if (editingCategory) {
        await updateExperienceCategory(editingCategory.id, data);
        setToast({ type: 'success', message: `Kategori pengalaman "${data.label}" berhasil diperbarui.` });
      } else {
        await createExperienceCategory(data);
        setToast({ type: 'success', message: `Kategori pengalaman "${data.label}" berhasil ditambahkan.` });
      }
    }
    loadAllConfigs();
  };

  const handleSaveFilter = async (data) => {
    if (editingFilter) {
      await updateRoleFilter(editingFilter.id, data);
      setToast({ type: 'success', message: `Role filter "${data.label}" berhasil diperbarui.` });
    } else {
      await createRoleFilter(data);
      setToast({ type: 'success', message: `Role filter "${data.label}" berhasil ditambahkan.` });
    }
    loadAllConfigs();
  };

  // Delete handler
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    const { type, item } = deletingItem;
    try {
      if (type === 'workCat') {
        await deleteWorkCategory(item.id);
        setToast({ type: 'success', message: `Kategori karya "${item.label}" berhasil dihapus.` });
      } else if (type === 'expCat') {
        await deleteExperienceCategory(item.id);
        setToast({ type: 'success', message: `Kategori pengalaman "${item.label}" berhasil dihapus.` });
      } else if (type === 'roleFilter') {
        await deleteRoleFilter(item.id);
        setToast({ type: 'success', message: `Role filter "${item.label}" berhasil dihapus.` });
      }
      setDeletingItem(null);
      loadAllConfigs();
    } catch (err) {
      setToast({ type: 'error', message: `Gagal menghapus: ${err.message}` });
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Konfigurasi Sistem & Taksonomi</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola kategori karya, kategori pengalaman, dan pemetaan role filter karya di MongoDB.
          </p>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('workCategories')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'workCategories'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers size={14} />
          <span>Kategori Karya ({workCats.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('expCategories')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'expCategories'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers size={14} />
          <span>Kategori Pengalaman ({expCats.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('roleFilters')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'roleFilters'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Filter size={14} />
          <span>Role Filters Karya ({roleFilters.length})</span>
        </button>
      </div>

      {/* TAB 1: WORK CATEGORIES */}
      {activeTab === 'workCategories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">Hierarki pengelompokan karya di website utama.</span>
            <button
              onClick={() => {
                setCategoryType('work');
                setEditingCategory(null);
                setIsCatModalOpen(true);
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              <span>Tambah Kategori Karya</span>
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs font-mono">Memuat kategori karya...</div>
          ) : workCats.length === 0 ? (
            <div className="p-12 text-center bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
              Belum ada kategori karya.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workCats.map((cat) => (
                <div key={cat.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-semibold">#{cat.order || 1}</span>
                      <h3 className="font-bold text-slate-900 text-sm">{cat.label}</h3>
                      <span className="font-mono text-[10px] text-slate-400">({cat.id})</span>
                    </div>
                    <p className="text-xs text-slate-500">{cat.subtitle}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setCategoryType('work');
                        setEditingCategory(cat);
                        setIsCatModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit kategori"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setDeletingItem({ type: 'workCat', item: cat })}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="Hapus kategori"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EXPERIENCE CATEGORIES */}
      {activeTab === 'expCategories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">Hierarki pengelompokan pengalaman di halaman timeline.</span>
            <button
              onClick={() => {
                setCategoryType('exp');
                setEditingCategory(null);
                setIsCatModalOpen(true);
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              <span>Tambah Kategori Pengalaman</span>
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs font-mono">Memuat kategori pengalaman...</div>
          ) : expCats.length === 0 ? (
            <div className="p-12 text-center bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
              Belum ada kategori pengalaman.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expCats.map((cat) => (
                <div key={cat.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-semibold">#{cat.order || 1}</span>
                      <h3 className="font-bold text-slate-900 text-sm">{cat.label}</h3>
                      <span className="font-mono text-[10px] text-slate-400">({cat.id})</span>
                    </div>
                    <p className="text-xs text-slate-500">{cat.subtitle}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setCategoryType('exp');
                        setEditingCategory(cat);
                        setIsCatModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit kategori"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setDeletingItem({ type: 'expCat', item: cat })}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="Hapus kategori"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ROLE FILTERS */}
      {activeTab === 'roleFilters' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">Pill filter role pada bagian Portofolio Karya.</span>
            <button
              onClick={() => {
                setEditingFilter(null);
                setIsFilterModalOpen(true);
              }}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              <span>Tambah Role Filter</span>
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs font-mono">Memuat role filters...</div>
          ) : roleFilters.length === 0 ? (
            <div className="p-12 text-center bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
              Belum ada role filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roleFilters.map((rf) => (
                <div key={rf.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-semibold">#{rf.order || 1}</span>
                      <h3 className="font-bold text-slate-900 text-sm">{rf.label}</h3>
                      <span className="font-mono text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded font-semibold">{rf.id}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingFilter(rf);
                          setIsFilterModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit filter"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setDeletingItem({ type: 'roleFilter', item: rf })}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Hapus filter"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600">
                    {rf.roles === null ? (
                      <span className="italic text-slate-400">Match Semua Karya (Show All)</span>
                    ) : Array.isArray(rf.roles) && rf.roles.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {rf.roles.map((r, i) => (
                          <span key={i} className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {r}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="italic text-amber-600">Tidak ada role yang dicocokkan</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category Editor Modal */}
      {isCatModalOpen && (
        <CategoryEditorModal
          category={editingCategory}
          categoryType={categoryType}
          onClose={() => setIsCatModalOpen(false)}
          onSave={handleSaveCategory}
        />
      )}

      {/* Role Filter Editor Modal */}
      {isFilterModalOpen && (
        <RoleFilterEditorModal
          filter={editingFilter}
          onClose={() => setIsFilterModalOpen(false)}
          onSave={handleSaveFilter}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (() => {
        let usageCount = 0;
        let usageLabel = 'konten';
        if (deletingItem.type === 'workCat') {
          usageCount = worksList.filter((w) => w.category === deletingItem.item.id).length;
          usageLabel = 'karya';
        } else if (deletingItem.type === 'expCat') {
          usageCount = expList.filter((e) => e.type === deletingItem.item.id).length;
          usageLabel = 'pengalaman';
        } else if (deletingItem.type === 'roleFilter' && Array.isArray(deletingItem.item.roles)) {
          usageCount = worksList.filter((w) => deletingItem.item.roles.includes(w.role)).length;
          usageLabel = 'karya pencocokan';
        }

        const usageWarning = usageCount > 0
          ? `⚠️ Peringatan: Taksonomi ini saat ini digunakan oleh ${usageCount} ${usageLabel}! Menghapusnya akan berdampak pada tampilan publik.`
          : 'Konfigurasi ini akan dihapus dari MongoDB. Tidak ada konten aktif yang saat ini menggunakannya.';

        return (
          <DeleteConfirmModal
            title={`Hapus "${deletingItem.item.label}"?`}
            description={usageWarning}
            onClose={() => setDeletingItem(null)}
            onConfirm={handleDeleteConfirm}
          />
        );
      })()}
    </div>
  );
}
