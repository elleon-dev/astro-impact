import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Router } from "@/router";
import {
  ConfigsInitializer,
  GlobalDataProvider,
  VersionProvider,
} from "@/providers";

const queryClient = new QueryClient();

const App = () => {
  return (
    <VersionProvider>
      <ConfigsInitializer>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <GlobalDataProvider>
                <Router />
              </GlobalDataProvider>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ConfigsInitializer>
    </VersionProvider>
  );
};

export default App;
