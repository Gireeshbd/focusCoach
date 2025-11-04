"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { getSettings, updateSettings } from "@/lib/localStorage";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [defaultFocusTime, setDefaultFocusTime] = useState(90);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const settings = getSettings();
      setApiKey(settings.openAIApiKey || "");
      setDefaultFocusTime(settings.defaultFocusTime);
    }
  }, [isOpen]);

  const handleSave = () => {
    updateSettings({
      openAIApiKey: apiKey.trim() || null,
      defaultFocusTime,
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your FlowBoard preferences and API settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* OpenAI API Key */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">OpenAI API Key</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Your API key is stored locally in your browser and never sent to any
              server except OpenAI. Get your key from{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline"
              >
                platform.openai.com/api-keys
              </a>
            </p>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="pr-10 font-mono text-sm"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {apiKey && (
              <p className="text-xs text-green-600 font-medium">
                ✓ API key configured
              </p>
            )}
          </div>

          {/* Default Focus Time */}
          <div className="space-y-3">
            <Label htmlFor="focusTime">Default Focus Time</Label>
            <p className="text-sm text-muted-foreground">
              Set your default focus session duration (in minutes)
            </p>
            <div className="flex items-center gap-4">
              <input
                id="focusTime"
                type="range"
                min="15"
                max="120"
                step="15"
                value={defaultFocusTime}
                onChange={(e) => setDefaultFocusTime(Number(e.target.value))}
                className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="min-w-[80px] px-3 py-2 bg-muted rounded-md text-center border">
                <span className="text-xl font-bold">
                  {defaultFocusTime}
                </span>
                <span className="text-sm text-muted-foreground ml-1">min</span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>15 min</span>
              <span>120 min</span>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-muted rounded-lg border">
            <p className="text-sm text-foreground">
              <strong>💡 Pro Tip:</strong> The 1-90-0 method recommends 90 minutes for deep
              work sessions. Feel free to adjust based on your needs!
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saved}>
            {saved ? "Saved!" : "Save Settings"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
