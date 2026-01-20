import { Link } from 'react-router-dom';
import { Home, Mail, Phone, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Footer = ({ isLoading = false }: { isLoading?: boolean }) => {
  if (isLoading) {
    return (
      <footer className="bg-card border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Skeleton */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="w-9 h-9 rounded-xl" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Quick Links Skeleton */}
            <div>
              <Skeleton className="h-6 w-24 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>

            {/* For Renters Skeleton */}
            <div>
              <Skeleton className="h-6 w-24 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>

            {/* Contact Skeleton */}
            <div>
              <Skeleton className="h-6 w-20 mb-4" />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center">
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Home className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">HomeNest</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Find your perfect rental home with verified listings and trusted landlords.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/explore" className="text-muted-foreground hover:text-foreground transition-colors">
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link to="/map" className="text-muted-foreground hover:text-foreground transition-colors">
                  Map View
                </Link>
              </li>
              <li>
                <Link to="/auth?mode=signup" className="text-muted-foreground hover:text-foreground transition-colors">
                  List Your Property
                </Link>
              </li>
            </ul>
          </div>

          {/* For Renters */}
          <div>
            <h4 className="font-display font-semibold mb-4">For Renters</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/explore" className="text-muted-foreground hover:text-foreground transition-colors">
                  Search Homes
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground">Rental Tips</span>
              </li>
              <li>
                <span className="text-muted-foreground">FAQs</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                dev.patel.codinggita@gmail.com
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                +91 63542361905
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                Ahemedabad, Gujarat.
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 HomeNest. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
