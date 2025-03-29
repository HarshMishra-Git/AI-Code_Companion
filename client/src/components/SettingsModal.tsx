import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "./ui/dialog";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { useChatContext } from "@/context/ChatContext";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { settings, updateSettings } = useChatContext();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chat Settings</DialogTitle>
          <DialogDescription>
            Customize your chat experience to your preferences.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Temperature Setting */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="temperature">Temperature: {settings.temperature.toFixed(1)}</Label>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={1}
              step={0.1}
              value={[settings.temperature]}
              onValueChange={(value) => updateSettings({ temperature: value[0] })}
            />
            <p className="text-xs text-muted-foreground">
              Lower values (0.0) make responses more focused and deterministic.
              Higher values (1.0) make output more random and creative.
            </p>
          </div>
          
          {/* Max Length Setting */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="maxLength">Max Response Length: {settings.maxLength}</Label>
            </div>
            <Slider
              id="maxLength"
              min={1024}
              max={16384}
              step={1024}
              value={[settings.maxLength]}
              onValueChange={(value) => updateSettings({ maxLength: value[0] })}
            />
            <p className="text-xs text-muted-foreground">
              Maximum length of the AI's response. Longer responses can be more detailed but take more time.
            </p>
          </div>
          
          {/* Toggle Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="syntaxHighlighting">Syntax Highlighting</Label>
                <p className="text-xs text-muted-foreground">
                  Highlight code in responses
                </p>
              </div>
              <Switch
                id="syntaxHighlighting"
                checked={settings.syntaxHighlighting}
                onCheckedChange={(checked) => updateSettings({ syntaxHighlighting: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="darkMode">Dark Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Toggle between light and dark theme
                </p>
              </div>
              <Switch
                id="darkMode"
                checked={settings.darkMode}
                onCheckedChange={(checked) => updateSettings({ darkMode: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoScroll">Auto-scroll</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically scroll to the bottom of the chat
                </p>
              </div>
              <Switch
                id="autoScroll"
                checked={settings.autoScroll}
                onCheckedChange={(checked) => updateSettings({ autoScroll: checked })}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;