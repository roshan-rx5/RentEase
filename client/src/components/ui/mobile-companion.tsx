import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Smartphone, 
  Bell, 
  BellRing, 
  Send, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  Laptop,
  Tablet
} from "lucide-react";

interface MobileDevice {
  platform: 'ios' | 'android' | 'web';
  token: string;
  isActive: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export function MobileCompanion() {
  const [deviceToken, setDeviceToken] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'android' | 'web'>('android');
  const [testTitle, setTestTitle] = useState('Test Notification');
  const [testMessage, setTestMessage] = useState('This is a test push notification from RentFlow!');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get registered devices
  const { data: devicesData } = useQuery({
    queryKey: ['/api/mobile/devices'],
    queryFn: () => apiRequest('/api/mobile/devices')
  });

  // Get notification history
  const { data: notificationsData } = useQuery({
    queryKey: ['/api/mobile/notifications'],
    queryFn: () => apiRequest('/api/mobile/notifications')
  });

  // Register device mutation
  const registerDeviceMutation = useMutation({
    mutationFn: async (data: { token: string; platform: 'ios' | 'android' | 'web' }) => {
      return await apiRequest('/api/mobile/register-device', 'POST', {
        token: data.token,
        platform: data.platform,
        deviceInfo: {
          model: navigator.userAgent,
          osVersion: navigator.platform,
          appVersion: '1.0.0'
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Device Registered",
        description: "Your device has been registered for push notifications",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mobile/devices'] });
      setDeviceToken('');
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register device",
        variant: "destructive",
      });
    },
  });

  // Send test notification mutation
  const testNotificationMutation = useMutation({
    mutationFn: async (data: { title: string; message: string }) => {
      return await apiRequest('/api/mobile/test-notification', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Test Sent",
        description: "Test notification sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Send Failed",
        description: error.message || "Failed to send test notification",
        variant: "destructive",
      });
    },
  });

  // Mark notification as read mutation
  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return await apiRequest(`/api/mobile/notifications/${notificationId}/read`, 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mobile/notifications'] });
    }
  });

  const handleRegisterDevice = () => {
    if (!deviceToken.trim()) {
      toast({
        title: "Token Required",
        description: "Please enter a device token",
        variant: "destructive",
      });
      return;
    }
    registerDeviceMutation.mutate({ token: deviceToken, platform: selectedPlatform });
  };

  const handleSendTest = () => {
    if (!testTitle.trim() || !testMessage.trim()) {
      toast({
        title: "Fields Required",
        description: "Please enter both title and message",
        variant: "destructive",
      });
      return;
    }
    testNotificationMutation.mutate({ title: testTitle, message: testMessage });
  };

  const generateSampleToken = () => {
    const sampleTokens = {
      ios: 'aps_prod_' + Math.random().toString(36).substring(2, 15),
      android: 'fcm_' + Math.random().toString(36).substring(2, 20),
      web: 'web_push_' + Math.random().toString(36).substring(2, 18)
    };
    setDeviceToken(sampleTokens[selectedPlatform]);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'ios': return <Smartphone className="h-4 w-4" />;
      case 'android': return <Tablet className="h-4 w-4" />;
      case 'web': return <Laptop className="h-4 w-4" />;
      default: return <Smartphone className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
          <Smartphone className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mobile Companion</h2>
          <p className="text-gray-600">Manage push notifications and mobile app integration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Registration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Register Device
            </CardTitle>
            <CardDescription>
              Register your mobile device to receive push notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Platform
              </label>
              <div className="flex gap-2">
                {(['ios', 'android', 'web'] as const).map((platform) => (
                  <Button
                    key={platform}
                    variant={selectedPlatform === platform ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPlatform(platform)}
                    className="flex items-center gap-2"
                  >
                    {getPlatformIcon(platform)}
                    {platform.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Device Token
              </label>
              <div className="flex gap-2">
                <Input
                  value={deviceToken}
                  onChange={(e) => setDeviceToken(e.target.value)}
                  placeholder={`Enter ${selectedPlatform} token...`}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateSampleToken}
                >
                  Generate Sample
                </Button>
              </div>
            </div>

            <Button
              onClick={handleRegisterDevice}
              disabled={registerDeviceMutation.isPending}
              className="w-full"
            >
              {registerDeviceMutation.isPending ? "Registering..." : "Register Device"}
            </Button>
          </CardContent>
        </Card>

        {/* Test Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Test Notifications
            </CardTitle>
            <CardDescription>
              Send a test push notification to your registered devices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Title
              </label>
              <Input
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="Notification title"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Message
              </label>
              <Input
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Notification message"
              />
            </div>

            <Button
              onClick={handleSendTest}
              disabled={testNotificationMutation.isPending}
              className="w-full"
            >
              {testNotificationMutation.isPending ? "Sending..." : "Send Test Notification"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Registered Devices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Registered Devices
          </CardTitle>
          <CardDescription>
            Your devices registered for push notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {devicesData?.devices?.length > 0 ? (
            <div className="space-y-3">
              {devicesData.devices.map((device: MobileDevice, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getPlatformIcon(device.platform)}
                    <div>
                      <p className="font-medium">{device.platform.toUpperCase()}</p>
                      <p className="text-sm text-gray-500">{device.token}</p>
                    </div>
                  </div>
                  <Badge variant={device.isActive ? "default" : "secondary"}>
                    {device.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No devices registered yet</p>
              <p className="text-sm">Register a device above to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            Notification History
          </CardTitle>
          <CardDescription>
            Your recent push notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notificationsData?.notifications?.length > 0 ? (
            <div className="space-y-3">
              {notificationsData.notifications.map((notification: Notification) => (
                <div key={notification.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {notification.isRead ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {notification.type}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markReadMutation.mutate(notification.id)}
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
              <p className="text-sm">Push notifications will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}