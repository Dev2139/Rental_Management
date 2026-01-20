import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNotification } from '@/contexts/NotificationContext';
import { usePropertyStatusContext } from '@/contexts/PropertyStatusContext';
import { supabase } from '@/integrations/supabase/client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Plus, Home, Users, DollarSign, TrendingUp } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useOwnerProperties, useCreateProperty, useUpdateProperty, useDeleteProperty } from '@/hooks/useProperties';
import { useOwnerRequests, useUpdateRequestStatus } from '@/hooks/useRentalRequests';
import { useUserPayments } from '@/hooks/usePayments';
import { useImageUpload } from '@/hooks/useImageUpload';
import PropertyCard from '@/components/properties/PropertyCard';
import ImageUpload from '@/components/properties/ImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigate } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

type PropertyType = Database['public']['Enums']['property_type'];

const OwnerDashboard = () => {
  const { user, role, loading } = useAuth();
  const { data: properties, isLoading: propertiesLoading } = useOwnerProperties();
  const { data: requests } = useOwnerRequests();
  const { data: payments } = useUserPayments();
  const { getStatus, setStatus } = usePropertyStatusContext();
  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();
  const deleteProperty = useDeleteProperty();
  const { addNotification } = useNotification();
  const queryClient = useQueryClient();
  
  // Custom mutation for updating request status with notifications
  const updateRequest = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const { data, error } = await supabase
        .from('rental_requests')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ['owner-requests'] });
      await queryClient.invalidateQueries({ queryKey: ['tenant-requests'] });
      
      // Get the tenant profile to send notification
      const { data: tenantProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', data.tenant_id)
        .single();
      
      // Get the property details
      const { data: property } = await supabase
        .from('properties')
        .select('title')
        .eq('id', data.property_id)
        .single();
      
      // Add notification for the tenant
      addNotification({
        title: `Rental Request ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}!`,
        message: `Your request for ${property?.title || 'the property'} has been ${data.status}.`,
        type: data.status === 'approved' ? 'success' : 'warning',
        userId: data.tenant_id,
        actionUrl: `/tenant/dashboard`
      });
      
      toast.success(`Request ${data.status}!`);
    },
    onError: (error) => {
      toast.error('Failed to update request: ' + error.message);
    },
  });
  
  const { uploading, uploadedUrls, uploadImages, removeImage, clearImages } = useImageUpload();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  
  // Handle URL hash to auto-open edit dialog for specific property
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && properties) {
      const propertyId = hash.substring(1); // Remove # from hash
      const property = properties.find(p => p.id === propertyId);
      if (property) {
        openEditDialog(property);
        // Scroll to the property card
        setTimeout(() => {
          const element = document.getElementById(`property-${propertyId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            element.classList.add('ring-2', 'ring-primary');
            setTimeout(() => element.classList.remove('ring-2', 'ring-primary'), 2000);
          }
        }, 100);
      }
    }
  }, [properties]);
  const [newProperty, setNewProperty] = useState({
    title: '', description: '', property_type: '2bhk' as PropertyType, rent: '', deposit: '',
    address: '', city: '', state: '', latitude: '19.0760', longitude: '72.8777',
    bedrooms: '2', bathrooms: '1', area_sqft: '', amenities: '', rules: '',
  });

  if (loading) return <Layout><div className="flex items-center justify-center h-96">Loading...</div></Layout>;
  if (!user || role !== 'owner') return <Navigate to="/auth?mode=login" replace />;

  const handleImageUpload = async (files: FileList) => {
    if (user) {
      await uploadImages(files, user.id);
    }
  };

  const handleCreateProperty = async () => {
    await createProperty.mutateAsync({
      title: newProperty.title, description: newProperty.description,
      property_type: newProperty.property_type, rent: Number(newProperty.rent),
      deposit: Number(newProperty.deposit), address: newProperty.address,
      city: newProperty.city, state: newProperty.state || null,
      latitude: Number(newProperty.latitude), longitude: Number(newProperty.longitude),
      bedrooms: Number(newProperty.bedrooms), bathrooms: Number(newProperty.bathrooms),
      area_sqft: newProperty.area_sqft ? Number(newProperty.area_sqft) : null,
      amenities: newProperty.amenities ? newProperty.amenities.split(',').map(a => a.trim()) : null,
      rules: newProperty.rules || null, images: uploadedUrls.length > 0 ? uploadedUrls : null, is_available: true,
    });
    setIsCreateOpen(false);
    clearImages();
    setNewProperty({ title: '', description: '', property_type: '2bhk', rent: '', deposit: '', address: '', city: '', state: '', latitude: '19.0760', longitude: '72.8777', bedrooms: '2', bathrooms: '1', area_sqft: '', amenities: '', rules: '' });
  };
  
  const handleEditProperty = async () => {
    if (!editingProperty) return;
    
    await updateProperty.mutateAsync({
      id: editingProperty.id,
      title: editingProperty.title,
      description: editingProperty.description,
      property_type: editingProperty.property_type,
      rent: Number(editingProperty.rent),
      deposit: Number(editingProperty.deposit),
      address: editingProperty.address,
      city: editingProperty.city,
      state: editingProperty.state || null,
      latitude: Number(editingProperty.latitude),
      longitude: Number(editingProperty.longitude),
      bedrooms: Number(editingProperty.bedrooms),
      bathrooms: Number(editingProperty.bathrooms),
      area_sqft: editingProperty.area_sqft ? Number(editingProperty.area_sqft) : null,
      amenities: editingProperty.amenities ? editingProperty.amenities.split(',').map(a => a.trim()) : null,
      rules: editingProperty.rules || null,
      is_available: editingProperty.is_available,
    });
    
    // Save status to context/localStorage
    if (editingProperty.status) {
      setStatus(editingProperty.id, editingProperty.status);
    }
    
    setIsEditOpen(false);
    setEditingProperty(null);
  };
  
  const openEditDialog = (property: any) => {
    setEditingProperty({
      ...property,
      rent: String(property.rent),
      deposit: String(property.deposit),
      bedrooms: String(property.bedrooms),
      bathrooms: String(property.bathrooms),
      area_sqft: property.area_sqft ? String(property.area_sqft) : '',
      amenities: property.amenities ? property.amenities.join(', ') : '',
    });
    setIsEditOpen(true);
  };

  const pendingRequests = requests?.filter(r => r.status === 'pending') || [];
  const totalRevenue = payments?.filter(p => p.status === 'completed').reduce((acc, p) => acc + Number(p.amount), 0) || 0;
  
  // Set up real-time subscription for rental requests when component mounts
  useEffect(() => {
    if (!user) return;
    
    // Subscribe to rental_requests table for this owner
    const channel = supabase
      .channel('rental-requests-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'rental_requests',
          filter: `owner_id=eq.${user.id}`,
        },
        (payload) => {
          // Add notification when a new rental request is received
          addNotification({
            title: 'New Rental Request!',
            message: `A tenant has requested your property.`,
            type: 'info',
            userId: user.id,
            actionUrl: '/owner/dashboard',
          });
        }
      )
      .subscribe();
    
    // Clean up subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, addNotification]);
  
  // Set up real-time subscription for property updates
  useEffect(() => {
    if (!user) return;
    
    // Subscribe to properties table for this owner
    const channel = supabase
      .channel('property-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'properties',
          filter: `owner_id=eq.${user.id}`,
        },
        (payload) => {
          // Add notification when a property is updated
          addNotification({
            title: 'Property Updated!',
            message: `Your property listing has been updated.`,
            type: 'info',
            userId: user.id,
            actionUrl: '/owner/dashboard',
          });
        }
      )
      .subscribe();
    
    // Clean up subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, addNotification]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Owner Dashboard</h1>
            <p className="text-muted-foreground">Manage your properties and requests</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary gap-2"><Plus className="w-4 h-4" />Add Property</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>List New Property</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Title</Label><Input value={newProperty.title} onChange={(e) => setNewProperty({...newProperty, title: e.target.value})} placeholder="Modern 2BHK Apartment" /></div>
                  <div className="space-y-2"><Label>Type</Label><Select value={newProperty.property_type} onValueChange={(v: PropertyType) => setNewProperty({...newProperty, property_type: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1bhk">1 BHK</SelectItem><SelectItem value="2bhk">2 BHK</SelectItem><SelectItem value="3bhk">3 BHK</SelectItem><SelectItem value="studio">Studio</SelectItem><SelectItem value="pg">PG</SelectItem><SelectItem value="villa">Villa</SelectItem><SelectItem value="apartment">Apartment</SelectItem></SelectContent></Select></div>
                </div>
                <div className="space-y-2"><Label>Description</Label><Textarea value={newProperty.description} onChange={(e) => setNewProperty({...newProperty, description: e.target.value})} placeholder="Describe your property..." rows={3} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Monthly Rent ($)</Label><Input type="number" value={newProperty.rent} onChange={(e) => setNewProperty({...newProperty, rent: e.target.value})} placeholder="2500" /></div>
                  <div className="space-y-2"><Label>Security Deposit ($)</Label><Input type="number" value={newProperty.deposit} onChange={(e) => setNewProperty({...newProperty, deposit: e.target.value})} placeholder="5000" /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>Address</Label><Input value={newProperty.address} onChange={(e) => setNewProperty({...newProperty, address: e.target.value})} placeholder="123 Main St" /></div>
                  <div className="space-y-2"><Label>City</Label><Input value={newProperty.city} onChange={(e) => setNewProperty({...newProperty, city: e.target.value})} placeholder="San Francisco" /></div>
                  <div className="space-y-2"><Label>State</Label><Input value={newProperty.state} onChange={(e) => setNewProperty({...newProperty, state: e.target.value})} placeholder="CA" /></div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2"><Label>Bedrooms</Label><Input type="number" value={newProperty.bedrooms} onChange={(e) => setNewProperty({...newProperty, bedrooms: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Bathrooms</Label><Input type="number" value={newProperty.bathrooms} onChange={(e) => setNewProperty({...newProperty, bathrooms: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Area (sqft)</Label><Input type="number" value={newProperty.area_sqft} onChange={(e) => setNewProperty({...newProperty, area_sqft: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Latitude</Label><Input value={newProperty.latitude} onChange={(e) => setNewProperty({...newProperty, latitude: e.target.value})} /></div>
                </div>
                <div className="space-y-2">
                  <Label>Property Images</Label>
                  <ImageUpload
                    images={uploadedUrls}
                    uploading={uploading}
                    onUpload={handleImageUpload}
                    onRemove={removeImage}
                    maxImages={6}
                  />
                </div>
                <Button className="btn-primary w-full" onClick={handleCreateProperty} disabled={createProperty.isPending || uploading}>
                  {createProperty.isPending ? 'Creating...' : uploading ? 'Uploading images...' : 'Create Listing'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Edit Property Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Edit Property</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Title</Label><Input value={editingProperty?.title || ''} onChange={(e) => setEditingProperty({...editingProperty, title: e.target.value})} placeholder="Modern 2BHK Apartment" /></div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={editingProperty?.property_type || '2bhk'} onValueChange={(v) => setEditingProperty({...editingProperty, property_type: v as PropertyType})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1bhk">1 BHK</SelectItem>
                        <SelectItem value="2bhk">2 BHK</SelectItem>
                        <SelectItem value="3bhk">3 BHK</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="pg">PG</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2"><Label>Description</Label><Textarea value={editingProperty?.description || ''} onChange={(e) => setEditingProperty({...editingProperty, description: e.target.value})} placeholder="Describe your property..." rows={3} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Monthly Rent ($)</Label><Input type="number" value={editingProperty?.rent || ''} onChange={(e) => setEditingProperty({...editingProperty, rent: e.target.value})} placeholder="2500" /></div>
                  <div className="space-y-2"><Label>Security Deposit ($)</Label><Input type="number" value={editingProperty?.deposit || ''} onChange={(e) => setEditingProperty({...editingProperty, deposit: e.target.value})} placeholder="5000" /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>Address</Label><Input value={editingProperty?.address || ''} onChange={(e) => setEditingProperty({...editingProperty, address: e.target.value})} placeholder="123 Main St" /></div>
                  <div className="space-y-2"><Label>City</Label><Input value={editingProperty?.city || ''} onChange={(e) => setEditingProperty({...editingProperty, city: e.target.value})} placeholder="San Francisco" /></div>
                  <div className="space-y-2"><Label>State</Label><Input value={editingProperty?.state || ''} onChange={(e) => setEditingProperty({...editingProperty, state: e.target.value})} placeholder="CA" /></div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2"><Label>Bedrooms</Label><Input type="number" value={editingProperty?.bedrooms || ''} onChange={(e) => setEditingProperty({...editingProperty, bedrooms: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Bathrooms</Label><Input type="number" value={editingProperty?.bathrooms || ''} onChange={(e) => setEditingProperty({...editingProperty, bathrooms: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Area (sqft)</Label><Input type="number" value={editingProperty?.area_sqft || ''} onChange={(e) => setEditingProperty({...editingProperty, area_sqft: e.target.value})} /></div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={editingProperty?.status || 'available'} onValueChange={(v) => setEditingProperty({...editingProperty, status: v as 'available' | 'rented' | 'under_maintenance'})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="rented">Rented</SelectItem>
                        <SelectItem value="under_maintenance">Under Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Amenities (comma separated)</Label>
                  <Input 
                    value={editingProperty?.amenities || ''} 
                    onChange={(e) => setEditingProperty({...editingProperty, amenities: e.target.value})} 
                    placeholder="WiFi, Parking, Pool, Gym" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rules</Label>
                  <Textarea 
                    value={editingProperty?.rules || ''} 
                    onChange={(e) => setEditingProperty({...editingProperty, rules: e.target.value})} 
                    placeholder="No pets, No smoking, etc." 
                    rows={2}
                  />
                </div>
                <Button className="btn-primary w-full" onClick={handleEditProperty} disabled={updateProperty.isPending}>
                  {updateProperty.isPending ? 'Updating...' : 'Save Changes'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[{ icon: Home, label: 'Properties', value: properties?.length || 0 }, { icon: Users, label: 'Pending Requests', value: pendingRequests.length }, { icon: DollarSign, label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}` }, { icon: TrendingUp, label: 'This Month', value: `$${(totalRevenue * 0.3).toLocaleString()}` }].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card">
              <stat.icon className="w-8 h-8 text-primary mb-2" />
              <p className="text-2xl font-display font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="properties">
          <TabsList><TabsTrigger value="properties">My Properties</TabsTrigger><TabsTrigger value="requests">Requests {pendingRequests.length > 0 && <Badge className="ml-2 badge-pending">{pendingRequests.length}</Badge>}</TabsTrigger><TabsTrigger value="payments">Payments</TabsTrigger></TabsList>
          
          <TabsContent value="properties" className="mt-6">
            {properties && properties.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((p) => (
                  <div key={p.id} id={`property-${p.id}`} className="relative group">
                    <PropertyCard property={p} />
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0"
                        onClick={() => openEditDialog(p)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        </svg>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0 text-red-500 border-red-500 hover:bg-red-50"
                        onClick={() => deleteProperty.mutate(p.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2">
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (<div className="text-center py-12 bg-muted/30 rounded-2xl"><Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No properties yet. Add your first listing!</p></div>)}
          </TabsContent>
          
          <TabsContent value="requests" className="mt-6">
            {requests && requests.length > 0 ? (
              <div className="space-y-4">{requests.map((req) => (
                <div key={req.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                  <div><p className="font-semibold">{req.property?.title}</p><p className="text-sm text-muted-foreground">{req.tenant?.full_name} • {req.tenant?.email}</p>{req.message && <p className="text-sm mt-2">"{req.message}"</p>}</div>
                  <div className="flex items-center gap-2">
                    {req.status === 'pending' ? (<><Button size="sm" variant="outline" onClick={() => updateRequest.mutate({ id: req.id, status: 'rejected' })}>Reject</Button><Button size="sm" className="btn-primary" onClick={() => updateRequest.mutate({ id: req.id, status: 'approved' })}>Approve</Button></>) : <Badge className={req.status === 'approved' ? 'badge-approved' : 'badge-rejected'}>{req.status}</Badge>}
                  </div>
                </div>
              ))}</div>
            ) : (<div className="text-center py-12 text-muted-foreground">No rental requests yet</div>)}
          </TabsContent>
          
          <TabsContent value="payments" className="mt-6">
            {payments && payments.length > 0 ? (
              <div className="space-y-3">{payments.map((p) => (
                <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                  <div><p className="font-semibold">{p.property?.title}</p><p className="text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</p></div>
                  <div className="text-right"><p className="font-bold text-primary">${Number(p.amount).toLocaleString()}</p><Badge className={p.status === 'completed' ? 'badge-approved' : 'badge-pending'}>{p.status}</Badge></div>
                </div>
              ))}</div>
            ) : (<div className="text-center py-12 text-muted-foreground">No payments received yet</div>)}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default OwnerDashboard;
