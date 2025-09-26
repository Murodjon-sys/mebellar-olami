"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  User,
  Store,
  Bell,
  Shield,
  Database,
  Save,
  RotateCcw,
  Upload,
  Download,
  Key,
  Mail,
  Phone,
  Globe,
  Clock,
  DollarSign,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = React.useState({
    // Admin Profile
    adminProfile: {
      name: "",
      email: "",
      phone: "",
      avatar: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },

    // Store Settings
    store: {
      name: "",
      description: "",
      phone: "",
      email: "",
      address: "",
      logo: "",
      currency: "UZS",
      businessHours: {
        monday: { open: "09:00", close: "18:00", closed: false },
        tuesday: { open: "09:00", close: "18:00", closed: false },
        wednesday: { open: "09:00", close: "18:00", closed: false },
        thursday: { open: "09:00", close: "18:00", closed: false },
        friday: { open: "09:00", close: "18:00", closed: false },
        saturday: { open: "09:00", close: "15:00", closed: false },
        sunday: { open: "10:00", close: "14:00", closed: true },
      },
    },

    // Notifications
    notifications: {
      emailNewOrders: true,
      emailOrderStatus: true,
      emailNewCustomers: false,
      telegramBotToken: "",
      telegramChatId: "",
      telegramNewOrders: false,
      telegramOrderStatus: false,
      smsNewOrders: false,
      smsOrderStatus: false,
      smsProvider: "",
      smsApiKey: "",
    },

    // System Settings
    system: {
      defaultProductAvailability: true,
      autoConfirmOrders: false,
      taxRate: 0,
      shippingFee: 0,
      paymentMethods: {
        cash: true,
        card: false,
        online: false,
      },
    },

    // Security Settings
    security: {
      twoFactorEnabled: false,
      maxLoginAttempts: 5,
      sessionTimeout: 60,
      requireStrongPassword: true,
      passwordMinLength: 8,
    },

    // Backup Settings
    backup: {
      autoBackup: false,
      backupFrequency: "daily",
      retainBackups: 7,
    },
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("profile");
  const [showPassword, setShowPassword] = React.useState(false);
  const [uploadingFile, setUploadingFile] = React.useState(null);

  const API = (path) => {
    const base = import.meta.env.VITE_API_URL || "http://localhost:3001";
    return `${base}${path}`;
  };

  // Load settings
  const loadSettings = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API("/api/settings"));
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Sozlamalarni yuklashda xatolik");

      setSettings((prev) => ({
        ...prev,
        ...data.data,
      }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Save settings
  const saveSettings = async (section) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess("");

      const res = await fetch(API("/api/settings"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          data: settings[section],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Saqlashda xatolik");

      setSuccess("Sozlamalar muvaffaqiyatli saqlandi!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file, type) => {
    if (!file) return;

    try {
      setUploadingFile(type);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const res = await fetch(API("/api/settings/upload"), {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Fayl yuklashda xatolik");

      // Update settings with new file URL
      if (type === "avatar") {
        setSettings((prev) => ({
          ...prev,
          adminProfile: { ...prev.adminProfile, avatar: data.url },
        }));
      } else if (type === "logo") {
        setSettings((prev) => ({
          ...prev,
          store: { ...prev.store, logo: data.url },
        }));
      }

      setSuccess("Fayl muvaffaqiyatli yuklandi!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploadingFile(null);
    }
  };

  // Create backup
  const createBackup = async () => {
    try {
      setLoading(true);
      const res = await fetch(API("/api/settings/backup"), {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Zaxira yaratishda xatolik");

      setSuccess("Zaxira muvaffaqiyatli yaratildi!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const updateNestedSetting = (section, parent, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parent]: {
          ...prev[section][parent],
          [field]: value,
        },
      },
    }));
  };

  const resetSection = (section) => {
    if (confirm("Haqiqatan ham bu bo'limni dastlabki holatga qaytarasizmi?")) {
      loadSettings();
    }
  };

  const days = [
    { key: "monday", name: "Dushanba" },
    { key: "tuesday", name: "Seshanba" },
    { key: "wednesday", name: "Chorshanba" },
    { key: "thursday", name: "Payshanba" },
    { key: "friday", name: "Juma" },
    { key: "saturday", name: "Shanba" },
    { key: "sunday", name: "Yakshanba" },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Tizim sozlamalari
          </CardTitle>
          <CardDescription className="text-gray-400">
            Boshqaruv paneli va do'kon sozlamalarini boshqaring.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg text-green-400 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {success}
            </div>
          )}

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-6 bg-gray-700">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-gray-600"
              >
                <User className="h-4 w-4 mr-2" />
                Profil
              </TabsTrigger>
              <TabsTrigger
                value="store"
                className="data-[state=active]:bg-gray-600"
              >
                <Store className="h-4 w-4 mr-2" />
                Do'kon
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:bg-gray-600"
              >
                <Bell className="h-4 w-4 mr-2" />
                Xabarlar
              </TabsTrigger>
              <TabsTrigger
                value="system"
                className="data-[state=active]:bg-gray-600"
              >
                <Settings className="h-4 w-4 mr-2" />
                Tizim
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:bg-gray-600"
              >
                <Shield className="h-4 w-4 mr-2" />
                Xavfsizlik
              </TabsTrigger>
              <TabsTrigger
                value="backup"
                className="data-[state=active]:bg-gray-600"
              >
                <Database className="h-4 w-4 mr-2" />
                Zaxira
              </TabsTrigger>
            </TabsList>

            {/* Admin Profile Settings */}
            <TabsContent value="profile" className="space-y-6">
              <Card className="bg-gray-700 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white">
                    Admin profil sozlamalari
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Shaxsiy ma'lumotlaringizni yangilang va parolni
                    o'zgartiring.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-name" className="text-gray-300">
                        To'liq ism
                      </Label>
                      <Input
                        id="admin-name"
                        value={settings.adminProfile.name}
                        onChange={(e) =>
                          updateSetting("adminProfile", "name", e.target.value)
                        }
                        className="bg-gray-600 border-gray-500 text-white"
                        placeholder="Ismingizni kiriting"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="admin-email" className="text-gray-300">
                        Email
                      </Label>
                      <Input
                        id="admin-email"
                        type="email"
                        value={settings.adminProfile.email}
                        onChange={(e) =>
                          updateSetting("adminProfile", "email", e.target.value)
                        }
                        className="bg-gray-600 border-gray-500 text-white"
                        placeholder="email@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="admin-phone" className="text-gray-300">
                        Telefon
                      </Label>
                      <Input
                        id="admin-phone"
                        type="tel"
                        value={settings.adminProfile.phone}
                        onChange={(e) =>
                          updateSetting("adminProfile", "phone", e.target.value)
                        }
                        className="bg-gray-600 border-gray-500 text-white"
                        placeholder="+998 xx xxx xx xx"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Profil rasmi</Label>
                      <div className="flex items-center gap-4">
                        {settings.adminProfile.avatar && (
                          <img
                            src={settings.adminProfile.avatar}
                            alt="Avatar"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleFileUpload(e.target.files[0], "avatar")
                            }
                            className="bg-gray-600 border-gray-500 text-white file:bg-gray-500 file:text-white file:border-0"
                          />
                          {uploadingFile === "avatar" && (
                            <p className="text-xs text-gray-400 mt-1">
                              Yuklanmoqda...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-600 pt-4">
                    <h4 className="text-lg font-medium text-white mb-4">
                      Parolni o'zgartirish
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="current-password"
                          className="text-gray-300"
                        >
                          Joriy parol
                        </Label>
                        <div className="relative">
                          <Input
                            id="current-password"
                            type={showPassword ? "text" : "password"}
                            value={settings.adminProfile.currentPassword}
                            onChange={(e) =>
                              updateSetting(
                                "adminProfile",
                                "currentPassword",
                                e.target.value
                              )
                            }
                            className="bg-gray-600 border-gray-500 text-white pr-10"
                            placeholder="Joriy parolingizni kiriting"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-password" className="text-gray-300">
                          Yangi parol
                        </Label>
                        <Input
                          id="new-password"
                          type={showPassword ? "text" : "password"}
                          value={settings.adminProfile.newPassword}
                          onChange={(e) =>
                            updateSetting(
                              "adminProfile",
                              "newPassword",
                              e.target.value
                            )
                          }
                          className="bg-gray-600 border-gray-500 text-white"
                          placeholder="Yangi parolingizni kiriting"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="confirm-password"
                          className="text-gray-300"
                        >
                          Parolni tasdiqlash
                        </Label>
                        <Input
                          id="confirm-password"
                          type={showPassword ? "text" : "password"}
                          value={settings.adminProfile.confirmPassword}
                          onChange={(e) =>
                            updateSetting(
                              "adminProfile",
                              "confirmPassword",
                              e.target.value
                            )
                          }
                          className="bg-gray-600 border-gray-500 text-white"
                          placeholder="Yangi parolingizni takrorlang"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => saveSettings("adminProfile")}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Saqlash
                    </Button>
                    <Button
                      onClick={() => resetSection("adminProfile")}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Qaytarish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Store Settings */}
            <TabsContent value="store" className="space-y-6">
              <Card className="bg-gray-700 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white">
                    Do'kon sozlamalari
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Do'koningiz haqidagi asosiy ma'lumotlarni sozlang.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="store-name" className="text-gray-300">
                        Do'kon nomi
                      </Label>
                      <Input
                        id="store-name"
                        value={settings.store.name}
                        onChange={(e) =>
                          updateSetting("store", "name", e.target.value)
                        }
                        className="bg-gray-600 border-gray-500 text-white"
                        placeholder="Do'kon nomini kiriting"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="store-email" className="text-gray-300">
                        Do'kon email
                      </Label>
                      <Input
                        id="store-email"
                        type="email"
                        value={settings.store.email}
                        onChange={(e) =>
                          updateSetting("store", "email", e.target.value)
                        }
                        className="bg-gray-600 border-gray-500 text-white"
                        placeholder="info@dokon.uz"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="store-phone" className="text-gray-300">
                        Do'kon telefoni
                      </Label>
                      <Input
                        id="store-phone"
                        type="tel"
                        value={settings.store.phone}
                        onChange={(e) =>
                          updateSetting("store", "phone", e.target.value)
                        }
                        className="bg-gray-600 border-gray-500 text-white"
                        placeholder="+998 xx xxx xx xx"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="store-currency" className="text-gray-300">
                        Pul birligi
                      </Label>
                      <select
                        id="store-currency"
                        value={settings.store.currency}
                        onChange={(e) =>
                          updateSetting("store", "currency", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                      >
                        <option value="UZS">UZS - O'zbek so'm</option>
                        <option value="USD">USD - Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="RUB">RUB - Rubl</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="store-description"
                      className="text-gray-300"
                    >
                      Do'kon haqida
                    </Label>
                    <Textarea
                      id="store-description"
                      value={settings.store.description}
                      onChange={(e) =>
                        updateSetting("store", "description", e.target.value)
                      }
                      className="bg-gray-600 border-gray-500 text-white min-h-[100px]"
                      placeholder="Do'koningiz haqida qisqacha ma'lumot..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="store-address" className="text-gray-300">
                      Do'kon manzili
                    </Label>
                    <Textarea
                      id="store-address"
                      value={settings.store.address}
                      onChange={(e) =>
                        updateSetting("store", "address", e.target.value)
                      }
                      className="bg-gray-600 border-gray-500 text-white"
                      placeholder="To'liq manzilni kiriting..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Do'kon logotipi</Label>
                    <div className="flex items-center gap-4">
                      {settings.store.logo && (
                        <img
                          src={settings.store.logo}
                          alt="Logo"
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileUpload(e.target.files[0], "logo")
                          }
                          className="bg-gray-600 border-gray-500 text-white file:bg-gray-500 file:text-white file:border-0"
                        />
                        {uploadingFile === "logo" && (
                          <p className="text-xs text-gray-400 mt-1">
                            Yuklanmoqda...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white">
                      Ish vaqtlari
                    </h4>
                    <div className="space-y-3">
                      {days.map((day) => (
                        <div
                          key={day.key}
                          className="flex items-center gap-4 p-3 bg-gray-600 rounded-lg"
                        >
                          <div className="w-20">
                            <span className="text-gray-300">{day.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={
                                !settings.store.businessHours[day.key].closed
                              }
                              onCheckedChange={(checked) =>
                                updateNestedSetting(
                                  "store",
                                  "businessHours",
                                  day.key,
                                  {
                                    ...settings.store.businessHours[day.key],
                                    closed: !checked,
                                  }
                                )
                              }
                            />
                            <span className="text-sm text-gray-400">Ochiq</span>
                          </div>
                          {!settings.store.businessHours[day.key].closed && (
                            <div className="flex items-center gap-2 ml-4">
                              <Input
                                type="time"
                                value={
                                  settings.store.businessHours[day.key].open
                                }
                                onChange={(e) =>
                                  updateNestedSetting(
                                    "store",
                                    "businessHours",
                                    day.key,
                                    {
                                      ...settings.store.businessHours[day.key],
                                      open: e.target.value,
                                    }
                                  )
                                }
                                className="w-24 bg-gray-700 border-gray-500 text-white"
                              />
                              <span className="text-gray-400">-</span>
                              <Input
                                type="time"
                                value={
                                  settings.store.businessHours[day.key].close
                                }
                                onChange={(e) =>
                                  updateNestedSetting(
                                    "store",
                                    "businessHours",
                                    day.key,
                                    {
                                      ...settings.store.businessHours[day.key],
                                      close: e.target.value,
                                    }
                                  )
                                }
                                className="w-24 bg-gray-700 border-gray-500 text-white"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => saveSettings("store")}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Saqlash
                    </Button>
                    <Button
                      onClick={() => resetSection("store")}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Qaytarish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="bg-gray-700 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white">
                    Xabar sozlamalari
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Email, Telegram va SMS xabarlarni sozlang.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Email Notifications */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Email xabarlari
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                        <div>
                          <span className="text-white">
                            Yangi buyurtmalar haqida
                          </span>
                          <p className="text-sm text-gray-400">
                            Yangi buyurtma kelganda email yuborish
                          </p>
                        </div>
                        <Switch
                          checked={settings.notifications.emailNewOrders}
                          onCheckedChange={(checked) =>
                            updateSetting(
                              "notifications",
                              "emailNewOrders",
                              checked
                            )
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                        <div>
                          <span className="text-white">
                            Buyurtma holati o'zgarishi
                          </span>
                          <p className="text-sm text-gray-400">
                            Buyurtma holati o'zgarganda email yuborish
                          </p>
                        </div>
                        <Switch
                          checked={settings.notifications.emailOrderStatus}
                          onCheckedChange={(checked) =>
                            updateSetting(
                              "notifications",
                              "emailOrderStatus",
                              checked
                            )
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                        <div>
                          <span className="text-white">Yangi mijozlar</span>
                          <p className="text-sm text-gray-400">
                            Yangi mijoz ro'yxatdan o'tganda email yuborish
                          </p>
                        </div>
                        <Switch
                          checked={settings.notifications.emailNewCustomers}
                          onCheckedChange={(checked) =>
                            updateSetting(
                              "notifications",
                              "emailNewCustomers",
                              checked
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Telegram Notifications */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white">
                      Telegram xabarlari
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="telegram-bot-token"
                          className="text-gray-300"
                        >
                          Bot Token
                        </Label>
                        <Input
                          id="telegram-bot-token"
                          type="password"
                          value={settings.notifications.telegramBotToken}
                          onChange={(e) =>
                            updateSetting(
                              "notifications",
                              "telegramBotToken",
                              e.target.value
                            )
                          }
                          className="bg-gray-600 border-gray-500 text-white"
                          placeholder="Bot token ni kiriting"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="telegram-chat-id"
                          className="text-gray-300"
                        >
                          Chat ID
                        </Label>
                        <Input
                          id="telegram-chat-id"
                          value={settings.notifications.telegramChatId}
                          onChange={(e) =>
                            updateSetting(
                              "notifications",
                              "telegramChatId",
                              e.target.value
                            )
                          }
                          className="bg-gray-600 border-gray-500 text-white"
                          placeholder="Chat ID ni kiriting"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                        <span className="text-white">
                          Yangi buyurtmalar haqida Telegram
                        </span>
                        <Switch
                          checked={settings.notifications.telegramNewOrders}
                          onCheckedChange={(checked) =>
                            updateSetting(
                              "notifications",
                              "telegramNewOrders",
                              checked
                            )
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                        <span className="text-white">
                          Buyurtma holati o'zgarishi Telegram
                        </span>
                        <Switch
                          checked={settings.notifications.telegramOrderStatus}
                          onCheckedChange={(checked) =>
                            updateSetting(
                              "notifications",
                              "telegramOrderStatus",
                              checked
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* SMS Notifications */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      SMS xabarlari
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sms-provider" className="text-gray-300">
                          SMS provayder
                        </Label>
                        <select
                          id="sms-provider"
                          value={settings.notifications.smsProvider}
                          onChange={(e) =>
                            updateSetting(
                              "notifications",
                              "smsProvider",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                        >
                          <option value="">SMS provayderiniz tanlang</option>
                          <option value="eskiz">Eskiz.uz</option>
                          <option value="playmobile">PlayMobile</option>
                          <option value="smsuz">SMS.uz</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sms-api-key" className="text-gray-300">
                          API Key
                        </Label>
                        <Input
                          id="sms-api-key"
                          type="password"
                          value={settings.notifications.smsApiKey}
                          onChange={(e) =>
                            updateSetting(
                              "notifications",
                              "smsApiKey",
                              e.target.value
                            )
                          }
                          className="bg-gray-600 border-gray-500 text-white"
                          placeholder="API kalitni kiriting"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                        <span className="text-white">
                          Yangi buyurtmalar haqida SMS
                        </span>
                        <Switch
                          checked={settings.notifications.smsNewOrders}
                          onCheckedChange={(checked) =>
                            updateSetting(
                              "notifications",
                              "smsNewOrders",
                              checked
                            )
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                        <span className="text-white">
                          Buyurtma holati o'zgarishi SMS
                        </span>
                        <Switch
                          checked={settings.notifications.smsOrderStatus}
                          onCheckedChange={(checked) =>
                            updateSetting(
                              "notifications",
                              "smsOrderStatus",
                              checked
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => saveSettings("notifications")}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Saqlash
                    </Button>
                    <Button
                      onClick={() => resetSection("notifications")}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Qaytarish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Settings */}
            <TabsContent value="system" className="space-y-6">
              <Card className="bg-gray-700 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white">
                    Tizim sozlamalari
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Umumiy tizim sozlamalarini boshqaring.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                      <div>
                        <span className="text-white">
                          Mahsulotlar sukut bo'yicha mavjud
                        </span>
                        <p className="text-sm text-gray-400">
                          Yangi mahsulotlar avtomatik mavjud deb belgilanadi
                        </p>
                      </div>
                      <Switch
                        checked={settings.system.defaultProductAvailability}
                        onCheckedChange={(checked) =>
                          updateSetting(
                            "system",
                            "defaultProductAvailability",
                            checked
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                      <div>
                        <span className="text-white">
                          Buyurtmalarni avtomatik tasdiqlash
                        </span>
                        <p className="text-sm text-gray-400">
                          Yangi buyurtmalar avtomatik tasdiqlanadi
                        </p>
                      </div>
                      <Switch
                        checked={settings.system.autoConfirmOrders}
                        onCheckedChange={(checked) =>
                          updateSetting("system", "autoConfirmOrders", checked)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="tax-rate"
                        className="text-gray-300 flex items-center gap-2"
                      >
                        <DollarSign className="h-4 w-4" />
                        Soliq miqdori (%)
                      </Label>
                      <Input
                        id="tax-rate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={settings.system.taxRate}
                        onChange={(e) =>
                          updateSetting(
                            "system",
                            "taxRate",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="bg-gray-600 border-gray-500 text-white"
                        placeholder="0.0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shipping-fee" className="text-gray-300">
                        Yetkazib berish narxi
                      </Label>
                      <Input
                        id="shipping-fee"
                        type="number"
                        min="0"
                        value={settings.system.shippingFee}
                        onChange={(e) =>
                          updateSetting(
                            "system",
                            "shippingFee",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="bg-gray-600 border-gray-500 text-white"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white">
                      To'lov usullari
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                        <span className="text-white">Naqd pul</span>
                        <Switch
                          checked={settings.system.paymentMethods.cash}
                          onCheckedChange={(checked) =>
                            updateNestedSetting(
                              "system",
                              "paymentMethods",
                              "cash",
                              checked
                            )
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                        <span className="text-white">Plastik karta</span>
                        <Switch
                          checked={settings.system.paymentMethods.card}
                          onCheckedChange={(checked) =>
                            updateNestedSetting(
                              "system",
                              "paymentMethods",
                              "card",
                              checked
                            )
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                        <span className="text-white">Onlayn to'lov</span>
                        <Switch
                          checked={settings.system.paymentMethods.online}
                          onCheckedChange={(checked) =>
                            updateNestedSetting(
                              "system",
                              "paymentMethods",
                              "online",
                              checked
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => saveSettings("system")}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Saqlash
                    </Button>
                    <Button
                      onClick={() => resetSection("system")}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Qaytarish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6">
              <Card className="bg-gray-700 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white">
                    Xavfsizlik sozlamalari
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Hisobingiz xavfsizligini kuchaytiradigan sozlamalar.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                      <div>
                        <span className="text-white flex items-center gap-2">
                          <Key className="h-4 w-4" />
                          Ikki bosqichli autentifikatsiya
                        </span>
                        <p className="text-sm text-gray-400">
                          Qo'shimcha xavfsizlik uchun 2FA yoqish
                        </p>
                      </div>
                      <Switch
                        checked={settings.security.twoFactorEnabled}
                        onCheckedChange={(checked) =>
                          updateSetting("security", "twoFactorEnabled", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                      <div>
                        <span className="text-white">Kuchli parol talabi</span>
                        <p className="text-sm text-gray-400">
                          Parol kamida 8 ta belgi va aralash harflar bo'lishi
                          kerak
                        </p>
                      </div>
                      <Switch
                        checked={settings.security.requireStrongPassword}
                        onCheckedChange={(checked) =>
                          updateSetting(
                            "security",
                            "requireStrongPassword",
                            checked
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="max-login-attempts"
                        className="text-gray-300"
                      >
                        Maksimal kirish urinishi
                      </Label>
                      <Input
                        id="max-login-attempts"
                        type="number"
                        min="1"
                        max="10"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) =>
                          updateSetting(
                            "security",
                            "maxLoginAttempts",
                            parseInt(e.target.value) || 5
                          )
                        }
                        className="bg-gray-600 border-gray-500 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="session-timeout"
                        className="text-gray-300 flex items-center gap-2"
                      >
                        <Clock className="h-4 w-4" />
                        Sessiya tugash vaqti (daqiqa)
                      </Label>
                      <Input
                        id="session-timeout"
                        type="number"
                        min="5"
                        max="480"
                        value={settings.security.sessionTimeout}
                        onChange={(e) =>
                          updateSetting(
                            "security",
                            "sessionTimeout",
                            parseInt(e.target.value) || 60
                          )
                        }
                        className="bg-gray-600 border-gray-500 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="password-min-length"
                        className="text-gray-300"
                      >
                        Minimal parol uzunligi
                      </Label>
                      <Input
                        id="password-min-length"
                        type="number"
                        min="4"
                        max="50"
                        value={settings.security.passwordMinLength}
                        onChange={(e) =>
                          updateSetting(
                            "security",
                            "passwordMinLength",
                            parseInt(e.target.value) || 8
                          )
                        }
                        className="bg-gray-600 border-gray-500 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => saveSettings("security")}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Saqlash
                    </Button>
                    <Button
                      onClick={() => resetSection("security")}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Qaytarish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Backup & Export Settings */}
            <TabsContent value="backup" className="space-y-6">
              <Card className="bg-gray-700 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white">
                    Zaxira va eksport sozlamalari
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Ma'lumotlaringizni zaxiralang va eksport qiling.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                      <div>
                        <span className="text-white">Avtomatik zaxiralash</span>
                        <p className="text-sm text-gray-400">
                          Ma'lumotlarni belgilangan vaqtda avtomatik zaxiralash
                        </p>
                      </div>
                      <Switch
                        checked={settings.backup.autoBackup}
                        onCheckedChange={(checked) =>
                          updateSetting("backup", "autoBackup", checked)
                        }
                      />
                    </div>
                  </div>

                  {settings.backup.autoBackup && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="backup-frequency"
                          className="text-gray-300"
                        >
                          Zaxiralash chastotasi
                        </Label>
                        <select
                          id="backup-frequency"
                          value={settings.backup.backupFrequency}
                          onChange={(e) =>
                            updateSetting(
                              "backup",
                              "backupFrequency",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                        >
                          <option value="daily">Har kuni</option>
                          <option value="weekly">Har hafta</option>
                          <option value="monthly">Har oy</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="retain-backups"
                          className="text-gray-300"
                        >
                          Zaxiralarni saqlash muddati (kun)
                        </Label>
                        <Input
                          id="retain-backups"
                          type="number"
                          min="1"
                          max="365"
                          value={settings.backup.retainBackups}
                          onChange={(e) =>
                            updateSetting(
                              "backup",
                              "retainBackups",
                              parseInt(e.target.value) || 7
                            )
                          }
                          className="bg-gray-600 border-gray-500 text-white"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white">
                      Qo'lda boshqarish
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={createBackup}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Database className="h-4 w-4 mr-2" />
                        Hozir zaxiralash
                      </Button>

                      <Button
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Mahsulotlarni eksport
                      </Button>

                      <Button
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Buyurtmalarni eksport
                      </Button>

                      <Button
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Mijozlarni eksport
                      </Button>

                      <Button
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Ma'lumotlarni import
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => saveSettings("backup")}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Saqlash
                    </Button>
                    <Button
                      onClick={() => resetSection("backup")}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Qaytarish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
