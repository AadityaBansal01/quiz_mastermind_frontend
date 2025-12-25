import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Edit2, Save, X, User as UserIcon, Mail, Hash, GraduationCap, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { authAPI } from '@/utils/api';
import { useEffect } from 'react';

export default function Profile() {
  const navigate = useNavigate();
 const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    class: user?.class?.toString() || '',
    rollNumber: user?.rollNumber || '',
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
const [passwordData, setPasswordData] = useState({
  currentPassword: "",
  newPassword: "",
});


useEffect(() => {
  if (user) {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      class: user.class?.toString() || '',
      rollNumber: user.rollNumber || '',
    });
  }
}, [user]);


  const handleSave = async () => {
  try {
    setSaving(true);

    const res = await authAPI.updateProfile({
      name: formData.name,
      class: Number(formData.class),
      rollNumber: formData.rollNumber,
    });

    const updatedUser = res?.data?.user;
    if (!updatedUser) throw new Error("No user returned");

    // ✅ FORCE UPDATE EVERYWHERE
    setUser(updatedUser);
    localStorage.setItem("mathquiz_user", JSON.stringify(updatedUser));

    // ✅ EXIT EDIT MODE IMMEDIATELY
    setIsEditing(false);

    toast.success("Profile updated successfully");
  } catch (error: any) {
    console.error("Profile update error:", error);

    toast.error(
      error?.response?.data?.message || "Profile update failed"
    );
  } finally {
    setSaving(false);
  }
};



const handleChangePassword = async () => {
  try {
    const res = await authAPI.changePassword(passwordData);

    if (res.data.success) {
      toast.success("Password changed successfully");
      setPasswordData({ currentPassword: "", newPassword: "" });
      setShowPasswordForm(false);
    }
  } catch (error: any) {
    toast.error(
      error?.response?.data?.message || "Failed to change password"
    );
  }
};


  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      class: user?.class?.toString() || '',
      rollNumber: user?.rollNumber || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12 container mx-auto px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="bg-card rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="gradient-primary p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-white">
                  <h1 className="text-2xl font-bold">{user?.name}</h1>
                  <p className="text-white/80">{user?.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full bg-white/20 text-sm font-medium">
                    {user?.role === 'admin' ? 'Administrator' : 'Student'}
                  </span>
                </div>
              </div>
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-white text-primary hover:bg-white/90"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Left Column - Personal Info */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                        <UserIcon className="w-4 h-4 text-muted-foreground" />
                        Full Name
                      </Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="rounded-xl"
                        />
                      ) : (
                        <div className="p-3 rounded-xl bg-secondary">
                          <p className="font-medium">{user?.name}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        Email Address
                      </Label>
                      <div className="p-3 rounded-xl bg-secondary/50">
                        <p className="font-medium text-muted-foreground">{user?.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Email cannot be changed
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="role" className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        Role
                      </Label>
                      <div className="p-3 rounded-xl bg-secondary/50">
                        <p className="font-medium capitalize">{user?.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Academic Info */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Academic Information</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="class" className="flex items-center gap-2 mb-2">
                        <GraduationCap className="w-4 h-4 text-muted-foreground" />
                        Class
                      </Label>
                      {isEditing ? (
                        <Select 
                          value={formData.class} 
                          onValueChange={(value) => setFormData({ ...formData, class: value })}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="11">Class 11</SelectItem>
                            <SelectItem value="12">Class 12</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-3 rounded-xl bg-secondary">
                          <p className="font-medium">Class {user?.class}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="rollNumber" className="flex items-center gap-2 mb-2">
                        <Hash className="w-4 h-4 text-muted-foreground" />
                        Roll Number
                      </Label>
                      {isEditing ? (
                        <Input
                          id="rollNumber"
                          value={formData.rollNumber}
                          onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                          className="rounded-xl"
                        />
                      ) : (
                        <div className="p-3 rounded-xl bg-secondary">
                          <p className="font-medium">{user?.rollNumber}</p>
                        </div>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-primary/10 border-l-4 border-primary">
                      <p className="text-sm font-medium mb-1">Account Created</p>
                      <p className="text-xs text-muted-foreground">
                        {user?.createdAt 
                          ? new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Section - Only for Students */}
            {user?.role === 'student' && (
              <div className="border-t pt-8">
                <h2 className="text-lg font-semibold mb-4">Your Statistics</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
                    <p className="text-3xl font-bold text-primary mb-1">{user?.qodStreak || 0}</p>
                    <p className="text-sm text-muted-foreground">Day Streak</p>
                  </div>
                  <div className="p-6 rounded-xl bg-gradient-to-br from-success/10 to-info/10">
                    <p className="text-3xl font-bold text-success mb-1">{user?.totalPoints || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Points</p>
                  </div>
                  <div className="p-6 rounded-xl bg-gradient-to-br from-warning/10 to-destructive/10">
                    <p className="text-3xl font-bold text-warning mb-1">
                      {user?.lastQodDate 
                        ? new Date(user.lastQodDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">Last QOD Attempt</p>
                  </div>
                </div>
              </div>
            )}

            {/* Change Password Section */}
            <div className="border-t mt-8 pt-8">
              <h2 className="text-lg font-semibold mb-4">Security</h2>
              <div className="p-6 rounded-xl bg-secondary/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium mb-1">Password</p>
                    <p className="text-sm text-muted-foreground">
                      Last changed: Never (using default password)
                    </p>
                  </div>
                  <Button
  variant="outline"
  onClick={() => setShowPasswordForm(!showPasswordForm)}
>
  Change Password
</Button>
                </div>
{showPasswordForm && (
  <div className="mt-4 space-y-4">
    <div>
      <Label>Current Password</Label>
      <Input
        type="password"
        value={passwordData.currentPassword}
        onChange={(e) =>
          setPasswordData({
            ...passwordData,
            currentPassword: e.target.value,
          })
        }
      />
    </div>

    <div>
      <Label>New Password</Label>
      <Input
        type="password"
        value={passwordData.newPassword}
        onChange={(e) =>
          setPasswordData({
            ...passwordData,
            newPassword: e.target.value,
          })
        }
      />
    </div>

    <div className="flex gap-2">
      <Button onClick={handleChangePassword}>
        Update Password
      </Button>
      <Button
        variant="outline"
        onClick={() => setShowPasswordForm(false)}
      >
        Cancel
      </Button>
    </div>
  </div>
)}




              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}