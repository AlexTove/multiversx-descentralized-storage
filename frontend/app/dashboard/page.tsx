import { FileManager } from "@/components/file-manager/index";
import { Navbar } from "@/components/navbar";

export default function FilesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <FileManager />
      </main>
    </div>
  );
}