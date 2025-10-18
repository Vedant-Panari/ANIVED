import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Crown } from "lucide-react";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"free" | "premium">("premium");

  const plans = {
    free: {
      name: "Free",
      price: "$0",
      period: "per month",
      description: "Basic anime streaming with ads",
      features: [
        { name: "Limited anime library", included: true },
        { name: "720p streaming quality", included: true },
        { name: "Community features", included: true },
        { name: "Ad-supported viewing", included: false, note: "Includes ads" },
        { name: "Offline downloads", included: false },
        { name: "4K Ultra HD streaming", included: false },
        { name: "Early access to new episodes", included: false },
      ],
      buttonText: "Current Plan",
      buttonVariant: "outline" as const,
    },
    premium: {
      name: "Premium",
      price: "$9.99",
      period: "per month",
      description: "Ad-free streaming with premium features",
      popular: true,
      features: [
        { name: "Full anime library access", included: true },
        { name: "4K Ultra HD streaming", included: true },
        { name: "Ad-free experience", included: true },
        { name: "Offline downloads", included: true },
        { name: "Early access to new episodes", included: true },
        { name: "Multiple device streaming", included: true },
        { name: "Premium customer support", included: true },
      ],
      buttonText: "Upgrade to Premium",
      buttonVariant: "default" as const,
      savings: "Save 20% with annual billing",
    },
  };

  const handleUpgrade = () => {
    // TODO: Implement subscription upgrade logic
    console.log("Upgrading to", selectedPlan);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="subscription-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-accent" />
            Choose Your Plan
          </DialogTitle>
          <DialogDescription>
            Unlock premium features and enjoy ad-free anime streaming
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Free Plan */}
          <div
            className={`border rounded-lg p-6 cursor-pointer transition-colors ${
              selectedPlan === "free"
                ? "border-primary bg-primary/5"
                : "border-border bg-card"
            }`}
            onClick={() => setSelectedPlan("free")}
            data-testid="plan-free"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {plans.free.name}
              </h3>
              <div className="text-3xl font-bold text-foreground">
                {plans.free.price}
              </div>
              <div className="text-muted-foreground">{plans.free.period}</div>
              <p className="text-sm text-muted-foreground mt-2">
                {plans.free.description}
              </p>
            </div>
            
            <ul className="space-y-3 mb-6">
              {plans.free.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  {feature.included ? (
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <X className="h-4 w-4 text-destructive flex-shrink-0" />
                  )}
                  <span
                    className={`text-sm ${
                      feature.included ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {feature.name}
                    {feature.note && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({feature.note})
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            
            <Button
              variant={plans.free.buttonVariant}
              className="w-full"
              disabled
              data-testid="button-free-plan"
            >
              {plans.free.buttonText}
            </Button>
          </div>
          
          {/* Premium Plan */}
          <div
            className={`border-2 rounded-lg p-6 cursor-pointer transition-colors relative ${
              selectedPlan === "premium"
                ? "border-primary bg-primary/5"
                : "border-primary bg-gradient-to-br from-primary/10 to-secondary/10"
            }`}
            onClick={() => setSelectedPlan("premium")}
            data-testid="plan-premium"
          >
            {/* Popular Badge */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4 py-1">
                Most Popular
              </Badge>
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {plans.premium.name}
              </h3>
              <div className="text-3xl font-bold text-foreground">
                {plans.premium.price}
              </div>
              <div className="text-muted-foreground">{plans.premium.period}</div>
              {plans.premium.savings && (
                <div className="text-sm text-accent mt-1">
                  {plans.premium.savings}
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                {plans.premium.description}
              </p>
            </div>
            
            <ul className="space-y-3 mb-6">
              {plans.premium.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-foreground">{feature.name}</span>
                </li>
              ))}
            </ul>
            
            <Button
              variant={plans.premium.buttonVariant}
              className="w-full"
              onClick={handleUpgrade}
              data-testid="button-premium-plan"
            >
              {plans.premium.buttonText}
            </Button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Cancel anytime. No contracts.{" "}
            <button className="text-primary hover:underline">
              Terms & Conditions
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
