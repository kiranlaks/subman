import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SettingsTest() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Settings Test</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Settings test functionality will be implemented here.</p>
      </CardContent>
    </Card>
  );
}