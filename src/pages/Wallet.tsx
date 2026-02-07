import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNWC } from '@/hooks/useNWCContext';
import { useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { Wallet as WalletIcon, Zap, ExternalLink, Copy, Trash2 } from 'lucide-react';

const Wallet = () => {
  const { user } = useCurrentUser();
  const { nwcUri, setNwcUri, isConnected, balance, disconnect } = useNWC();
  const { toast } = useToast();
  const [inputUri, setInputUri] = useState('');

  useSeoMeta({
    title: 'Wallet - erybody',
    description: 'Manage your Nostr Wallet Connect',
  });

  const handleConnect = () => {
    if (!inputUri.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid NWC connection string',
        variant: 'destructive',
      });
      return;
    }

    setNwcUri(inputUri);
    setInputUri('');
    toast({
      title: 'Connected',
      description: 'Wallet connected successfully',
    });
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: 'Disconnected',
      description: 'Wallet disconnected',
    });
  };

  const handleCopyUri = () => {
    if (nwcUri) {
      navigator.clipboard.writeText(nwcUri);
      toast({
        title: 'Copied',
        description: 'NWC URI copied to clipboard',
      });
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-12 px-4">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Please log in to manage your wallet</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
        <div className="flex items-center gap-3">
          <WalletIcon className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Wallet</h1>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Nostr Wallet Connect
            </CardTitle>
            <CardDescription>
              Connect your Lightning wallet using NWC to send zaps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isConnected ? (
              <>
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="font-medium text-green-500">Connected</span>
                    </div>
                    {balance !== null && (
                      <span className="text-sm text-muted-foreground">
                        Balance: {balance} sats
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Connection URI</Label>
                  <div className="flex gap-2">
                    <Input
                      value={nwcUri?.substring(0, 30) + '...'}
                      readOnly
                      className="flex-1"
                    />
                    <Button variant="outline" size="icon" onClick={handleCopyUri}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={handleDisconnect}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 border border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Not connected. Enter your NWC connection string to enable zaps.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nwc-uri">NWC Connection String</Label>
                  <Input
                    id="nwc-uri"
                    type="password"
                    placeholder="nostr+walletconnect://..."
                    value={inputUri}
                    onChange={(e) => setInputUri(e.target.value)}
                  />
                </div>

                <Button onClick={handleConnect} className="w-full">
                  Connect Wallet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* How to Get NWC */}
        <Card>
          <CardHeader>
            <CardTitle>How to Get NWC</CardTitle>
            <CardDescription>
              NWC (Nostr Wallet Connect) allows you to connect your Lightning wallet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Popular NWC providers:
              </p>
              
              <a
                href="https://getalby.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium">Alby</p>
                  <p className="text-sm text-muted-foreground">Browser extension wallet</p>
                </div>
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href="https://nwc.getalby.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium">Alby Hub</p>
                  <p className="text-sm text-muted-foreground">Self-hosted NWC</p>
                </div>
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href="https://app.mutinywallet.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium">Mutiny Wallet</p>
                  <p className="text-sm text-muted-foreground">Self-custodial Lightning wallet</p>
                </div>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Wallet;
