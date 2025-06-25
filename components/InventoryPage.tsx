
import React, { useState, useMemo } from 'react';
import { MOCK_SPARE_PARTS, BRAND_CONFIG, CURRENT_USER } from '../constants';
import { SparePart, UserRole } from '../types';
import { Modal } from './Modal';
import { PlusCircleIcon, EditIcon, TrashIcon, FilterIcon, SearchIcon, InventoryIcon as PageIcon } from './icons';

export const InventoryPage: React.FC = () => {
  const [parts, setParts] = useState<SparePart[]>(MOCK_SPARE_PARTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Partial<SparePart> | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const brandColors = BRAND_CONFIG.brand.colors;

  const openModalForNew = () => {
    setEditingPart({ name: '', sku: '', quantityInStock: 0, reorderLevel: 5, supplier: '', price:0 });
    setIsModalOpen(true);
  };

  const openModalForEdit = (part: SparePart) => {
    setEditingPart(part);
    setIsModalOpen(true);
  };

  const handleSavePart = () => {
    if (!editingPart || !editingPart.name || !editingPart.sku) {
        alert("Please fill name and SKU.");
        return;
    }

    const partToSave: SparePart = {
      ...editingPart,
      id: editingPart.id || `part-${Date.now()}`,
      name: editingPart.name!,
      sku: editingPart.sku!,
      quantityInStock: Number(editingPart.quantityInStock) || 0,
      reorderLevel: Number(editingPart.reorderLevel) || 0,
      supplier: editingPart.supplier || '',
      price: Number(editingPart.price) || 0,
    };

    if (editingPart.id) {
      setParts(parts.map(p => p.id === partToSave.id ? partToSave : p));
    } else {
      setParts([partToSave, ...parts]);
    }
    setIsModalOpen(false);
    setEditingPart(null);
  };
  
  const handleDeletePart = (partId: string) => {
    if (window.confirm('Are you sure you want to delete this part?')) {
        setParts(parts.filter(p => p.id !== partId));
    }
  };


  const handleInputChange = <K extends keyof SparePart,>(key: K, value: SparePart[K]) => {
     if(editingPart) setEditingPart({ ...editingPart, [key]: value });
  };
  
  const filteredParts = useMemo(() => {
    return parts.filter(part => {
        const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) || part.sku.toLowerCase().includes(searchTerm.toLowerCase()) || (part.supplier && part.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
        let matchesStock = true;
        if (stockFilter === 'IN_STOCK') matchesStock = part.quantityInStock > 0;
        else if (stockFilter === 'LOW_STOCK') matchesStock = part.quantityInStock > 0 && part.quantityInStock <= part.reorderLevel;
        else if (stockFilter === 'OUT_OF_STOCK') matchesStock = part.quantityInStock === 0;
        
        return matchesSearch && matchesStock;
    }).sort((a,b) => a.name.localeCompare(b.name));
  }, [parts, searchTerm, stockFilter]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold text-[${brandColors.secondary}]`}>Inventory Management</h1>
        {(CURRENT_USER.role === UserRole.SUPERVISOR || CURRENT_USER.role === UserRole.MANAGER) &&
        <button onClick={openModalForNew} className={`flex items-center bg-[${brandColors.primary}] hover:brightness-90 text-[${brandColors.secondary}] font-medium py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out`}>
          <PlusCircleIcon className="w-5 h-5 mr-2" /> Add New Part
        </button>
        }
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="search-inventory" className="block text-sm font-medium text-gray-700">Search</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    id="search-inventory"
                    className={`focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}] block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2`}
                    placeholder="Part name, SKU, or supplier..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>
          <div>
            <label htmlFor="stock-filter" className="block text-sm font-medium text-gray-700">Stock Status</label>
            <select id="stock-filter" value={stockFilter} onChange={(e) => setStockFilter(e.target.value as 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK')} className={`mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`}>
              <option value="ALL">All Stock Levels</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
          <div className="flex items-center">
             <FilterIcon className="h-5 w-5 text-gray-400 mr-2" />
             <span className="text-sm text-gray-600">{filteredParts.length} parts</span>
          </div>
        </div>
      </div>

      {filteredParts.length > 0 ? (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                {(CURRENT_USER.role === UserRole.SUPERVISOR || CURRENT_USER.role === UserRole.MANAGER) &&
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                }
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredParts.map(part => (
                <tr key={part.id} className={`hover:bg-gray-50 transition-colors ${part.quantityInStock <= part.reorderLevel && part.quantityInStock > 0 ? 'bg-yellow-50' : part.quantityInStock === 0 ? 'bg-red-50' : ''}`}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-[${brandColors.secondary}]`}>{part.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{part.sku}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${part.quantityInStock === 0 ? 'text-red-600' : part.quantityInStock <= part.reorderLevel ? 'text-yellow-600' : 'text-green-600'}`}>{part.quantityInStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{part.reorderLevel}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{part.supplier}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${part.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{part.location || 'N/A'}</td>
                  {(CURRENT_USER.role === UserRole.SUPERVISOR || CURRENT_USER.role === UserRole.MANAGER) &&
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => openModalForEdit(part)} className={`text-[${brandColors.secondary}] hover:text-[${brandColors.primary}] mr-3`}><EditIcon className="w-5 h-5 inline-block" /></button>
                    <button onClick={() => handleDeletePart(part.id)} className="text-red-600 hover:text-red-800"><TrashIcon className="w-5 h-5 inline-block" /></button>
                  </td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow">
            <PageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No parts found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or add new parts to the inventory.</p>
        </div>
      )}

      {editingPart && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPart.id ? 'Edit Part' : 'Add New Part'} size="md">
          <div className="space-y-4">
            <div>
              <label htmlFor="part-name" className="block text-sm font-medium text-gray-700">Part Name</label>
              <input type="text" id="part-name" value={editingPart.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`} />
            </div>
            <div>
              <label htmlFor="part-sku" className="block text-sm font-medium text-gray-700">SKU</label>
              <input type="text" id="part-sku" value={editingPart.sku || ''} onChange={(e) => handleInputChange('sku', e.target.value)} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="part-quantity" className="block text-sm font-medium text-gray-700">Quantity In Stock</label>
                    <input type="number" id="part-quantity" value={editingPart.quantityInStock || 0} onChange={(e) => handleInputChange('quantityInStock', parseInt(e.target.value, 10))} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`} />
                </div>
                <div>
                    <label htmlFor="part-reorder" className="block text-sm font-medium text-gray-700">Reorder Level</label>
                    <input type="number" id="part-reorder" value={editingPart.reorderLevel || 0} onChange={(e) => handleInputChange('reorderLevel', parseInt(e.target.value, 10))} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`} />
                </div>
            </div>
            <div>
              <label htmlFor="part-supplier" className="block text-sm font-medium text-gray-700">Supplier</label>
              <input type="text" id="part-supplier" value={editingPart.supplier || ''} onChange={(e) => handleInputChange('supplier', e.target.value)} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`} />
            </div>
             <div>
              <label htmlFor="part-price" className="block text-sm font-medium text-gray-700">Price (per unit)</label>
              <input type="number" step="0.01" id="part-price" value={editingPart.price || 0} onChange={(e) => handleInputChange('price', parseFloat(e.target.value))} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`} />
            </div>
             <div>
              <label htmlFor="part-location" className="block text-sm font-medium text-gray-700">Storage Location (Optional)</label>
              <input type="text" id="part-location" value={editingPart.location || ''} onChange={(e) => handleInputChange('location', e.target.value)} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`} />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
              <button type="button" onClick={handleSavePart} className={`px-4 py-2 text-sm font-medium text-[${brandColors.secondary}] bg-[${brandColors.primary}] rounded-md hover:brightness-90`}>{editingPart.id ? 'Save Changes' : 'Add Part'}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InventoryPage;
