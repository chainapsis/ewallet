import { KeplrEmbeddedProvider } from "@/keplr/KeplrEmbeddedProvider";
import Header from "@/components/Header";
import StatusBar from "@/components/StatusBar";
import CosmosTransactionForm from "@/components/CosmosTransactionForm";
import EvmTransactionForm from "./components/EvmTransactionForm";

function App() {
  return (
    <KeplrEmbeddedProvider>
      <div className="max-w-[920px] mx-auto my-10 p-5">
        <Header />
        <StatusBar />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CosmosTransactionForm />
          <EvmTransactionForm />
        </div>
      </div>
    </KeplrEmbeddedProvider>
  );
}

export default App;
