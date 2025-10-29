'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { migrationService } from '@/lib/migration/localStorage-to-supabase'
import { Loader2, CheckCircle, AlertCircle, Database } from 'lucide-react'

export function MigrationDialog() {
  const [open, setOpen] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [status, setStatus] = useState<{
    localCount: number
    supabaseCount: number
    migrationNeeded: boolean
  } | null>(null)
  const [result, setResult] = useState<{
    success: boolean
    migratedCount: number
    errors: string[]
  } | null>(null)

  useEffect(() => {
    checkMigrationStatus()
  }, [])

  const checkMigrationStatus = async () => {
    try {
      const status = await migrationService.getMigrationStatus()
      setStatus(status)
      
      // Auto-open dialog if migration is needed and no Supabase data exists
      if (status.migrationNeeded && status.supabaseCount === 0) {
        setOpen(true)
      }
    } catch (error) {
      console.error('Error checking migration status:', error)
    }
  }

  const handleMigration = async () => {
    setMigrating(true)
    setResult(null)

    try {
      const migrationResult = await migrationService.migrate()
      setResult(migrationResult)
      
      if (migrationResult.success) {
        // Refresh the page after successful migration
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      }
    } catch (error) {
      setResult({
        success: false,
        migratedCount: 0,
        errors: [`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      })
    } finally {
      setMigrating(false)
    }
  }

  if (!status?.migrationNeeded) {
    return null
  }

  return (
    <>
      {/* Migration notification banner */}
      <div className="fixed bottom-4 right-4 z-50">
        <Alert className="w-96">
          <Database className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Local data detected. Migrate to Supabase?</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setOpen(true)}
              className="ml-2"
            >
              Migrate
            </Button>
          </AlertDescription>
        </Alert>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Migrate Data to Supabase</DialogTitle>
            <DialogDescription>
              Transfer your local subscription data to the cloud-based Supabase backend.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!result && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium text-muted-foreground">Local Storage</p>
                    <p className="text-2xl font-bold">{status.localCount}</p>
                    <p className="text-xs text-muted-foreground">Subscriptions</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium text-muted-foreground">Supabase</p>
                    <p className="text-2xl font-bold">{status.supabaseCount}</p>
                    <p className="text-xs text-muted-foreground">Subscriptions</p>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This will:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Create a backup of your local data</li>
                      <li>Upload all subscriptions to Supabase</li>
                      <li>Optionally clear local storage after migration</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </>
            )}

            {result && (
              <div className="space-y-4">
                {result.success ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Successfully migrated {result.migratedCount} subscriptions!
                      <br />
                      The page will refresh in a few seconds...
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Migration completed with errors. {result.migratedCount} subscriptions migrated.
                    </AlertDescription>
                  </Alert>
                )}

                {result.errors.length > 0 && (
                  <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm font-medium text-red-800 mb-2">Errors:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {result.errors.map((error, index) => (
                        <li key={index} className="text-sm text-red-700">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={migrating}
            >
              {result?.success ? 'Close' : 'Cancel'}
            </Button>
            {!result && (
              <Button
                onClick={handleMigration}
                disabled={migrating}
              >
                {migrating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Migrating...
                  </>
                ) : (
                  'Start Migration'
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

