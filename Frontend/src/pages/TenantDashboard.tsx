import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Clock, CreditCard, CheckCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useTenantRequests } from '@/hooks/useRentalRequests';
import { useUserPayments, useCreatePayment } from '@/hooks/usePayments';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigate, Link } from 'react-router-dom';

const TenantDashboard = () => {
  const { user, role, loading } = useAuth();
  const { data: requests } = useTenantRequests();
  const { data: payments } = useUserPayments();
  const createPayment = useCreatePayment();
  const [payingRequest, setPayingRequest] = useState<string | null>(null);

  if (loading) return <Layout><div className="flex items-center justify-center h-96">Loading...</div></Layout>;
  if (!user || role !== 'tenant') return <Navigate to="/auth?mode=login" replace />;

  const handlePayRent = async (request: any) => {
    setPayingRequest(request.id);
    await createPayment.mutateAsync({
      propertyId: request.property_id,
      ownerId: request.owner_id,
      amount: request.property?.rent || 0,
      rentalRequestId: request.id,
    });
    setPayingRequest(null);
  };

  const approvedRequests = requests?.filter(r => r.status === 'approved') || [];
  const pendingRequests = requests?.filter(r => r.status === 'pending') || [];
  const totalPaid = payments?.filter(p => p.status === 'completed').reduce((acc, p) => acc + Number(p.amount), 0) || 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Tenant Dashboard</h1>
            <p className="text-muted-foreground">Manage your rentals and payments</p>
          </div>
          <Link to="/explore"><Button className="btn-primary">Browse Properties</Button></Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[{ icon: Home, label: 'Active Rentals', value: approvedRequests.length }, { icon: Clock, label: 'Pending Requests', value: pendingRequests.length }, { icon: CreditCard, label: 'Total Paid', value: `$${totalPaid.toLocaleString()}` }, { icon: CheckCircle, label: 'Payments Made', value: payments?.length || 0 }].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card">
              <stat.icon className="w-8 h-8 text-primary mb-2" />
              <p className="text-2xl font-display font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="requests">
          <TabsList><TabsTrigger value="requests">My Requests</TabsTrigger><TabsTrigger value="payments">Payment History</TabsTrigger></TabsList>
          
          <TabsContent value="requests" className="mt-6">
            {requests && requests.length > 0 ? (
              <div className="space-y-4">{requests.map((req) => (
                <div key={req.id} className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex gap-4">
                    {req.property?.images?.[0] && <img src={req.property.images[0]} alt="" className="w-20 h-20 rounded-lg object-cover" />}
                    <div>
                      <p className="font-semibold">{req.property?.title}</p>
                      <p className="text-sm text-muted-foreground">{req.property?.address}, {req.property?.city}</p>
                      <p className="text-primary font-bold mt-1">${Number(req.property?.rent || 0).toLocaleString()}/mo</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={req.status === 'approved' ? 'badge-approved' : req.status === 'rejected' ? 'badge-rejected' : 'badge-pending'}>{req.status}</Badge>
                    {req.status === 'approved' && (
                      <Dialog>
                        <DialogTrigger asChild><Button size="sm" className="btn-primary">Pay Rent</Button></DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Confirm Payment</DialogTitle></DialogHeader>
                          <div className="py-4">
                            <p className="text-center mb-4">Pay rent for <strong>{req.property?.title}</strong></p>
                            <p className="text-3xl font-bold text-center text-primary mb-6">${Number(req.property?.rent || 0).toLocaleString()}</p>
                            <Button className="w-full btn-primary" onClick={() => handlePayRent(req)} disabled={payingRequest === req.id}>{payingRequest === req.id ? 'Processing...' : 'Confirm Payment'}</Button>
                            <p className="text-xs text-center text-muted-foreground mt-4">This is a simulated payment for demo purposes</p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              ))}</div>
            ) : (<div className="text-center py-12 bg-muted/30 rounded-2xl"><Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground mb-4">No rental requests yet</p><Link to="/explore"><Button>Browse Properties</Button></Link></div>)}
          </TabsContent>
          
          <TabsContent value="payments" className="mt-6">
            {payments && payments.length > 0 ? (
              <div className="space-y-3">{payments.map((p) => (
                <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                  <div><p className="font-semibold">{p.property?.title}</p><p className="text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()} • {p.transaction_id}</p></div>
                  <div className="text-right"><p className="font-bold text-primary">${Number(p.amount).toLocaleString()}</p><Badge className="badge-approved">{p.status}</Badge></div>
                </div>
              ))}</div>
            ) : (<div className="text-center py-12 text-muted-foreground">No payment history yet</div>)}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TenantDashboard;
