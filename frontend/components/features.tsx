import { Shield, Upload, Database } from "lucide-react";

export function Features() {
  const features = [
    {
      icon: Shield,
      title: "Secure Authentication",
      description: "Connect securely with your MultiversX wallet for seamless access.",
    },
    {
      icon: Upload,
      title: "Easy File Upload",
      description: "Drag and drop your files or browse to upload directly to IPFS.",
    },
    {
      icon: Database,
      title: "Decentralized Storage",
      description: "Your files are stored on IPFS, ensuring permanent and distributed access.",
    },
  ];

  return (
    <section className="py-20 px-4 bg-muted/50">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 rounded-lg bg-background border"
            >
              <feature.icon className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}