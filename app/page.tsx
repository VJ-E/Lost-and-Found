import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Package,
  Shield,
  Bell,
  ArrowRight,
  MapPin,
  CheckCircle,
  Users,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
          <div className="relative mx-auto max-w-7xl px-4 py-24 sm:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Find What You Lost,
                <br />
                <span className="text-primary">Return What You Found</span>
              </h1>
              <p className="mt-6 text-pretty text-lg text-muted-foreground sm:text-xl">
                CampusFind connects lost items with their owners. Report what you lost
                or found, and help build a more connected campus community.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/items">
                  <Button size="lg" className="gap-2">
                    <Search className="h-5 w-5" />
                    Browse Items
                  </Button>
                </Link>
                <Link href="/items/new">
                  <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                    <Package className="h-5 w-5" />
                    Report an Item
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-b border-border py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                How CampusFind Works
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Simple, secure, and effective lost and found management
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-border bg-card">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    Report Items
                  </h3>
                  <p className="text-muted-foreground">
                    Lost something? Found something? Report it with detailed
                    descriptions and photos to help with identification.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    Search & Filter
                  </h3>
                  <p className="text-muted-foreground">
                    Browse items by category, location, or date. Our search makes
                    it easy to find what you are looking for.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    Secure Claims
                  </h3>
                  <p className="text-muted-foreground">
                    Submit a claim with proof of ownership. Our admin team verifies
                    each claim to ensure items go to the right person.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Bell className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    Track Status
                  </h3>
                  <p className="text-muted-foreground">
                    Monitor your reported items and claims. Get updates when
                    someone submits a claim or when your claim is reviewed.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    Campus Locations
                  </h3>
                  <p className="text-muted-foreground">
                    Specify exact campus locations to help others find or return
                    items more efficiently.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    Community Driven
                  </h3>
                  <p className="text-muted-foreground">
                    Join a campus-wide community helping each other reunite with
                    lost belongings.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-b border-border py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">24/7</div>
                <p className="mt-2 text-muted-foreground">Available Online</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">Verified</div>
                <p className="mt-2 text-muted-foreground">Claim Process</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">Secure</div>
                <p className="mt-2 text-muted-foreground">Campus Network</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="overflow-hidden rounded-2xl bg-card">
              <div className="px-6 py-16 sm:px-12 sm:py-24">
                <div className="mx-auto max-w-2xl text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-primary" />
                  <h2 className="mt-6 text-3xl font-bold text-foreground sm:text-4xl">
                    Ready to Get Started?
                  </h2>
                  <p className="mt-4 text-lg text-muted-foreground">
                    Join the campus community and start finding or reporting items
                    today. It only takes a minute to sign up.
                  </p>
                  <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link href="/auth/signup">
                      <Button size="lg" className="gap-2">
                        Create Account
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/items">
                      <Button size="lg" variant="outline">
                        Browse Without Account
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Search className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">CampusFind</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Campus Lost & Found System
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
