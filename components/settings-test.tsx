'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/use-local-storage';

export function SettingsTest() {
  const [testValue, setTestValue] = useLocalStorage('test-setting', 'default');
  const [inputValue, setInputValue] = useState('');

  const handleSave = () => {
    setTestValue(inputValue);
    setInputValue('');
  };

  const handleClear = () => {
    setTestValue('default');
    localStorage.removeItem('test-setting');
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Settings Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Current Saved Value:</label>
          <div className="p-2 bg-gray-100 rounded text-sm">{testValue}</div>
        </div>
        
        <div className="space-y-2">
          <Input
            placeholder="Enter new value"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={!inputValue}>
              Save to localStorage
            </Button>
            <Button onClick={handleClear} variant="outline">
              Clear
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-gray-500">
          This value should persist when you refresh the page or navigate away and come back.
        </div>
      </CardContent>
    </Card>
  );
}