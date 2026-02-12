"use client";

import { useState } from "react";
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

const initialSettings = getSettings();

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(initialSettings.openAIApiKey || "");
  const [defaultFocusTime, setDefaultFocusTime] = useState(initialSettings.defaultFocusTime);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings({
      openAIApiKey: apiKey.trim() || null,
      defaultFocusTime,
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 700);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Configure API and default focus duration.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="space-y-2">
            <Label htmlFor="apiKey">OpenAI API Key</Label>
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
                {showApiKey ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Stored locally in your browser.</p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="focusTime">Default Focus Time</Label>
            <div className="flex items-center gap-4">
              <input
                id="focusTime"
                type="range"
                min="15"
                max="120"
                step="15"
                value={defaultFocusTime}
                onChange={(e) => setDefaultFocusTime(Number(e.target.value))}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-secondary accent-primary"
              />
              <div className="min-w-[76px] rounded-md border bg-muted px-3 py-2 text-center">
                <span className="text-lg font-semibold">{defaultFocusTime}</span>
                <span className="ml-1 text-xs text-muted-foreground">min</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saved}>{saved ? "Saved" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
