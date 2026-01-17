import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Payment {
  id: string;
  property_id: string;
  tenant_id: string;
  owner_id: string;
  rental_request_id: string | null;
  amount: number;
  payment_type: string;
  status: 'pending' | 'completed' | 'failed';
  transaction_id: string | null;
  paid_at: string | null;
  created_at: string;
  property?: {
    title: string;
    address: string;
    city: string;
  };
}

export const useUserPayments = () => {
  const { user, role } = useAuth();

  return useQuery({
    queryKey: ['payments', user?.id, role],
    queryFn: async () => {
      if (!user) return [];

      const column = role === 'owner' ? 'owner_id' : 'tenant_id';

      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          property:properties(title, address, city)
        `)
        .eq(column, user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!user,
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ propertyId, ownerId, amount, rentalRequestId }: {
      propertyId: string;
      ownerId: string;
      amount: number;
      rentalRequestId?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      // Generate mock transaction ID
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const { data, error } = await supabase
        .from('payments')
        .insert({
          property_id: propertyId,
          tenant_id: user.id,
          owner_id: ownerId,
          amount,
          rental_request_id: rentalRequestId,
          status: 'completed',
          transaction_id: transactionId,
          paid_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Payment completed successfully!');
    },
    onError: (error) => {
      toast.error('Payment failed: ' + error.message);
    },
  });
};
