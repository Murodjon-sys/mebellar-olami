'use client';

import * as React from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  PlusCircle, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Star
} from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [viewing, setViewing] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [availableFilter, setAvailableFilter] = React.useState('all');
  const [form, setForm] = React.useState({
    name: "",
    price: "",
    category: "",
    description: "",
    image_url: "",
    colors: [],
    sizes: [],
    featured: false,
    available: true
  });

  const API = (path) => {
    const base = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    return `${base}${path}`;
  };

  const categories = React.useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
    return cats.sort();
  }, [products]);

  const filteredProducts = React.useMemo(() => {
    return products.filter(product => {
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'all' || 
        product.category === categoryFilter;
      
      const matchesAvailable = availableFilter === 'all' || 
        (availableFilter === 'available' ? product.available : !product.available);
      
      return matchesSearch && matchesCategory && matchesAvailable;
    });
  }, [products, searchTerm, categoryFilter, availableFilter]);

  const loadProducts = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API('/api/products?available=all'));
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Yuklashda xatolik');
      
      const normalized = (data.data || data.products || []).map((p) => ({
        id: p._id || p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        description: p.description || '',
        image_url: p.image_url || p.imageUrl || '',
        colors: p.colors || [],
        sizes: p.sizes || [],
        featured: p.featured || false,
        available: p.available !== false,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      }));
      setProducts(normalized);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { loadProducts(); }, [loadProducts]);

  const openCreate = () => { 
    setEditing(null); 
    setForm({ 
      name: "", 
      price: "", 
      category: "", 
      description: "", 
      image_url: "", 
      colors: [],
      sizes: [],
      featured: false,
      available: true 
    }); 
    setOpen(true); 
  };

  const openEdit = (p) => { 
    setEditing(p); 
    setForm({ 
      name: p.name || "", 
      price: String(p.price ?? ""), 
      category: p.category || "", 
      description: p.description || "",
      image_url: p.image_url || "",
      colors: p.colors || [],
      sizes: p.sizes || [],
      featured: p.featured || false,
      available: p.available !== false
    }); 
    setOpen(true); 
  };

  const openView = (p) => {
    setViewing(p);
    setViewOpen(true);
  };

  const closeModal = () => { setOpen(false); setViewOpen(false); };

  const onChange = (e) => {
    const { id, value, type, checked } = e.target;
    setForm((s) => ({ 
      ...s, 
      [id]: type === 'checkbox' ? checked : value 
    }));
  };

  const onSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const payload = { 
        ...form, 
        price: parseFloat(form.price || 0),
        colors: form.colors.filter(Boolean),
        sizes: form.sizes.filter(Boolean)
      };
      
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? API(`/api/products/${editing.id}`) : API('/api/products');
      const res = await fetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Saqlashda xatolik');
      
      setOpen(false);
      await loadProducts();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm('Haqiqatan ham o\'chirasizmi?')) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API(`/api/products/${id}`), { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'O\'chirishda xatolik');
      await loadProducts();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (product) => {
    try {
      const res = await fetch(API(`/api/products/${product.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, featured: !product.featured })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Yangilashda xatolik');
      await loadProducts();
    } catch (e) {
      setError(e.message);
    }
  };

  const toggleAvailable = async (product) => {
    try {
      const res = await fetch(API(`/api/products/${product.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, available: !product.available })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Yangilashda xatolik');
      await loadProducts();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleColorsChange = (value) => {
    const colors = value.split(',').map(c => c.trim()).filter(Boolean);
    setForm(s => ({ ...s, colors }));
  };

  const handleSizesChange = (value) => {
    const sizes = value.split(',').map(s => s.trim()).filter(Boolean);
    setForm(s => ({ ...s, sizes }));
  };

  return (
    <>
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Mahsulotlar
                <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                  {filteredProducts.length}
                </Badge>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Do'koningizdagi barcha mahsulotlarni boshqaring.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={openCreate} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                <PlusCircle className="h-4 w-4 mr-2" />
                Yangi qo'shish
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Mahsulot nomi yoki tavsifini qidiring..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px] bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Kategoriya" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha kategoriyalar</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={availableFilter} onValueChange={setAvailableFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Holat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha holatlar</SelectItem>
                <SelectItem value="available">Mavjud</SelectItem>
                <SelectItem value="unavailable">Mavjud emas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading && <p>Yuklanmoqda...</p>}
          {error && <p className="text-red-500">{error}</p>}
          
          {!loading && !error && products.length === 0 && (
            <div className="text-center py-10 space-y-4">
              <p>Hozircha mahsulotlar yo'q.</p>
              <div className="flex justify-center gap-3">
                <Button onClick={openCreate} className="bg-green-600 hover:bg-green-700 text-white">
                  Yangi qo'shish
                </Button>
                <Button 
                  onClick={async () => {
                    try { 
                      setLoading(true); 
                      setError(null); 
                      const r = await fetch(API('/api/products/seed'), { method: 'POST' }); 
                      const d = await r.json(); 
                      if(!r.ok || !d.success) throw new Error(d.error || 'Seed xatolik'); 
                      await loadProducts(); 
                    } catch(e){ 
                      setError(e.message); 
                    } finally { 
                      setLoading(false); 
                    } 
                  }} 
                  variant="secondary"
                  className="bg-gray-700 hover:bg-gray-600 text-white"
                >
                  Demo ma'lumotlarni yuklash
                </Button>
              </div>
            </div>
          )}

          {!loading && !error && filteredProducts.length > 0 && (
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              {/* Desktop/Table view */}
              <div className="hidden sm:block overflow-x-auto w-full">
                <Table className="min-w-[980px]">
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-gray-700/50">
                    <TableHead className="hidden w-[100px] sm:table-cell text-gray-300">Rasm</TableHead>
                    <TableHead className="text-gray-300">Nomi</TableHead>
                    <TableHead className="text-gray-300">Kategoriya</TableHead>
                    <TableHead className="text-gray-300">Holati</TableHead>
                    <TableHead className="hidden md:table-cell text-gray-300">Narxi</TableHead>
                    <TableHead className="hidden lg:table-cell text-gray-300">Sana</TableHead>
                    <TableHead>
                      <span className="sr-only">Harakatlar</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="border-gray-700 hover:bg-gray-700/50">
                      <TableCell className="hidden sm:table-cell">
                        <img
                          alt={product.name}
                          className="aspect-square rounded-md object-cover cursor-pointer hover:opacity-75"
                          height="64"
                          src={product.image_url || '/placeholder.svg'}
                          width="64"
                          onClick={() => openView(product)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-gray-400 truncate max-w-[200px]">
                            {product.description}
                          </div>
                        )}
                        <div className="flex gap-1 mt-1">
                          {product.featured && (
                            <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-400">
                              <Star className="h-3 w-3 mr-1" />
                              Mashhur
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-gray-500 text-gray-300">
                          {product.category || 'Kategoriyasiz'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={product.available ? "default" : "destructive"} 
                          className={`cursor-pointer ${
                            product.available 
                              ? "bg-green-600/20 text-green-400 border-green-500/30 hover:bg-green-600/30" 
                              : "bg-red-600/20 text-red-400 border-red-500/30 hover:bg-red-600/30"
                          }`}
                          onClick={() => toggleAvailable(product)}
                        >
                          {product.available ? 'Mavjud' : 'Yo\'q'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="font-semibold text-green-400">
                          {Number(product.price).toLocaleString()} so'm
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-gray-400">
                        {product.createdAt ? new Date(product.createdAt).toLocaleDateString('uz-UZ') : '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Menyuni ochish</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                            <DropdownMenuLabel className="text-gray-300">Harakatlar</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            <DropdownMenuItem 
                              onClick={() => openView(product)}
                              className="text-gray-300 hover:bg-gray-700"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Ko'rish
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openEdit(product)}
                              className="text-gray-300 hover:bg-gray-700"
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Tahrirlash
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => toggleFeatured(product)}
                              className="text-gray-300 hover:bg-gray-700"
                            >
                              <Star className="mr-2 h-4 w-4" />
                              {product.featured ? 'Mashhurligi olish' : 'Mashhur qilish'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            <DropdownMenuItem 
                              onClick={() => onDelete(product.id)}
                              className="text-red-400 hover:bg-red-900/20"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              O'chirish
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </div>

              {/* Mobile/Card view */}
              <div className="sm:hidden p-3 space-y-3">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="rounded-xl border border-gray-700 bg-gray-800/80 p-4 shadow-lg">
                    <div className="flex items-start gap-3">
                      {product.image_url && (
                        <img src={product.image_url} alt={product.name} className="w-16 h-16 rounded-md object-cover" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-white">{product.name}</div>
                        {product.description && (
                          <div className="text-xs text-gray-400 line-clamp-2">{product.description}</div>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="border-gray-500 text-gray-300">{product.category || 'Kategoriyasiz'}</Badge>
                          <Badge 
                            variant={product.available ? 'default' : 'destructive'}
                            className={`${product.available ? 'bg-green-600/20 text-green-400 border-green-500/30' : 'bg-red-600/20 text-red-400 border-red-500/30'}`}
                          >
                            {product.available ? 'Mavjud' : 'Yo\'q'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-400">{Number(product.price).toLocaleString()} so'm</div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <Button onClick={() => openView(product)} variant="outline" className="h-9 px-3 border-gray-600 text-gray-300">
                        <Eye className="h-4 w-4 mr-1" /> Ko'rish
                      </Button>
                      <Button onClick={() => openEdit(product)} className="h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white">
                        <Pencil className="h-4 w-4 mr-1" /> Tahrirlash
                      </Button>
                      <Button onClick={() => onDelete(product.id)} className="h-9 px-3 bg-red-600 hover:bg-red-700 text-white">
                        <Trash2 className="h-4 w-4 mr-1" /> O'chirish
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Mahsulotni tahrirlash' : "Yangi mahsulot qo'shish"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Mahsulot ma'lumotlarini kiriting va saqlash tugmasini bosing.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-gray-300">
                Nomi *
              </Label>
              <Input 
                id="name" 
                value={form.name} 
                onChange={onChange} 
                placeholder="Masalan, Zamonaviy Divan" 
                className="col-span-3 bg-gray-700 border-gray-600" 
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right text-gray-300">
                Kategoriya *
              </Label>
              <Input 
                id="category" 
                value={form.category} 
                onChange={onChange} 
                placeholder="Masalan, Divan" 
                className="col-span-3 bg-gray-700 border-gray-600"
                required 
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right text-gray-300">
                Narxi (so'm) *
              </Label>
              <Input 
                id="price" 
                type="number"
                value={form.price} 
                onChange={onChange} 
                placeholder="Masalan, 4500000" 
                className="col-span-3 bg-gray-700 border-gray-600"
                required 
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right text-gray-300 pt-2">
                Tavsif
              </Label>
              <Textarea 
                id="description" 
                value={form.description} 
                onChange={onChange} 
                placeholder="Mahsulot haqida batafsil ma'lumot..." 
                className="col-span-3 bg-gray-700 border-gray-600 min-h-[80px]" 
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image_url" className="text-right text-gray-300">
                Rasm URL
              </Label>
              <Input 
                id="image_url" 
                value={form.image_url} 
                onChange={onChange} 
                placeholder="https://example.com/image.jpg" 
                className="col-span-3 bg-gray-700 border-gray-600" 
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-gray-300">
                Ranglar
              </Label>
              <Input 
                value={form.colors.join(', ')}
                onChange={(e) => handleColorsChange(e.target.value)}
                placeholder="Masalan: qizil, ko'k, sariq (vergul bilan ajrating)" 
                className="col-span-3 bg-gray-700 border-gray-600" 
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-gray-300">
                O'lchamlar
              </Label>
              <Input 
                value={form.sizes.join(', ')}
                onChange={(e) => handleSizesChange(e.target.value)}
                placeholder="Masalan: S, M, L, XL (vergul bilan ajrating)" 
                className="col-span-3 bg-gray-700 border-gray-600" 
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-gray-300"></Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={form.featured}
                    onChange={onChange}
                    className="rounded border-gray-600 bg-gray-700"
                  />
                  <Label htmlFor="featured" className="text-sm text-gray-300">
                    Mashhur mahsulot sifatida belgilash
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="available"
                    checked={form.available}
                    onChange={onChange}
                    className="rounded border-gray-600 bg-gray-700"
                  />
                  <Label htmlFor="available" className="text-sm text-gray-300">
                    Mavjud (sotuvda)
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={closeModal} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              Bekor qilish
            </Button>
            <Button onClick={onSubmit} className="bg-green-600 hover:bg-green-700 text-white">
              {editing ? 'Yangilash' : 'Saqlash'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Mahsulot ma'lumotlari</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-4">
              {viewing.image_url && (
                <div className="flex justify-center">
                  <img
                    src={viewing.image_url}
                    alt={viewing.name}
                    className="w-48 h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Nomi:</span>
                  <span className="font-medium">{viewing.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Kategoriya:</span>
                  <span>{viewing.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Narxi:</span>
                  <span className="font-bold text-green-400">
                    {Number(viewing.price).toLocaleString()} so'm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Holat:</span>
                  <Badge variant={viewing.available ? "default" : "destructive"}>
                    {viewing.available ? 'Mavjud' : 'Yo\'q'}
                  </Badge>
                </div>
                {viewing.colors && viewing.colors.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ranglar:</span>
                    <span>{viewing.colors.join(', ')}</span>
                  </div>
                )}
                {viewing.sizes && viewing.sizes.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">O'lchamlar:</span>
                    <span>{viewing.sizes.join(', ')}</span>
                  </div>
                )}
                {viewing.description && (
                  <div>
                    <span className="text-gray-400">Tavsif:</span>
                    <p className="mt-1 text-sm">{viewing.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={closeModal} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              Yopish
            </Button>
            {viewing && (
              <Button onClick={() => {
                setViewOpen(false);
                openEdit(viewing);
              }} className="bg-blue-600 hover:bg-blue-700 text-white">
                Tahrirlash
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
