import { FC } from 'react';
import { useChatContext } from '@/context/ChatContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { 
    selectedModel, 
    setSelectedModel, 
    modelStatus, 
    setModelStatus,
    fineTuningMethod,
    setFineTuningMethod,
    deployModel 
  } = useChatContext();

  return (
    <aside className={`w-80 bg-dark-surface border-r border-slate-700 ${isOpen ? 'flex' : 'hidden'} md:flex flex-col`}>
      <div className="p-4 border-b border-slate-700">
        <div className="mb-4">
          <label htmlFor="model-select" className="block text-sm font-medium text-slate-300 mb-1">Base Model</label>
          <select 
            id="model-select" 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full px-3 py-2 bg-dark border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="codellama">Code Llama 7B</option>
            <option value="starcoder">StarCoder 7B</option>
            <option value="wizardcoder">WizardCoder 7B</option>
            <option value="mistral">Mistral 7B</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-1">Model Status</label>
          <div className="flex items-center space-x-2">
            <div className={`h-2.5 w-2.5 rounded-full ${modelStatus === 'ready' ? 'bg-secondary' : 'bg-yellow-500'}`}></div>
            <span id="model-status" className="text-sm">{modelStatus === 'ready' ? 'Ready' : modelStatus === 'deploying' ? 'Deploying...' : 'Deployed'}</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Primary Focus</label>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs font-medium">Python</span>
            <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs font-medium">JavaScript</span>
            <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs font-medium">HTML/CSS</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Training Data Sources</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center justify-between">
            <span>The Stack (BigCode)</span>
            <span className="w-4 h-4 flex items-center justify-center rounded-full bg-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          </li>
          <li className="flex items-center justify-between">
            <span>CodeAlpaca</span>
            <span className="w-4 h-4 flex items-center justify-center rounded-full bg-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          </li>
          <li className="flex items-center justify-between">
            <span>HumanEval</span>
            <span className="w-4 h-4 flex items-center justify-center rounded-full bg-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          </li>
          <li className="flex items-center justify-between text-slate-400">
            <span>GitHub Issues</span>
            <span className="w-4 h-4 flex items-center justify-center rounded-full bg-slate-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          </li>
        </ul>
      </div>
      
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Fine-Tuning Method</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input 
              type="radio" 
              id="qlora" 
              name="fine-tuning" 
              value="qlora" 
              checked={fineTuningMethod === 'qlora'}
              onChange={() => setFineTuningMethod('qlora')}
              className="text-primary focus:ring-primary"
            />
            <label htmlFor="qlora" className="text-sm">QLoRA</label>
            <span className="bg-green-900/30 text-green-400 text-xs px-1.5 py-0.5 rounded">Recommended</span>
          </div>
          <div className="flex items-center space-x-2">
            <input 
              type="radio" 
              id="full" 
              name="fine-tuning" 
              value="full" 
              checked={fineTuningMethod === 'full'}
              onChange={() => setFineTuningMethod('full')}
              className="text-primary focus:ring-primary"
            />
            <label htmlFor="full" className="text-sm">Full Fine-Tuning</label>
            <span className="bg-amber-900/30 text-amber-400 text-xs px-1.5 py-0.5 rounded">High GPU</span>
          </div>
          <div className="flex items-center space-x-2">
            <input 
              type="radio" 
              id="sft" 
              name="fine-tuning" 
              value="sft" 
              checked={fineTuningMethod === 'sft'}
              onChange={() => setFineTuningMethod('sft')}
              className="text-primary focus:ring-primary"
            />
            <label htmlFor="sft" className="text-sm">Supervised Fine-Tuning</label>
          </div>
        </div>
      </div>
      
      <div className="p-4 mt-auto">
        <button 
          onClick={deployModel}
          className="w-full bg-accent hover:bg-accent/90 text-white py-2 px-4 rounded flex items-center justify-center space-x-2 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <span>Deploy Model</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
