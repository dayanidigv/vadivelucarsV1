
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { BackButton } from "@/components/ui/BackButton"
import { toast } from "sonner"

export function Settings() {
    // In a real app, these would come from an API/Context
    const handleSave = () => {
        toast.success("Settings saved successfully")
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div className="flex items-center gap-4">
                <BackButton fallback="/dashboard" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">Manage your workshop preferences and business details.</p>
                </div>
            </div>
            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle>Business Profile</CardTitle>
                    <CardDescription>This information will appear on your invoices.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Shop Name *</Label>
                            <Input defaultValue="Vadivelu Cars" />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone Number *</Label>
                            <Input defaultValue="+91 8012526677" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Address *</Label>
                        <Input defaultValue="Near HP Petrol Bunk, Opp. SM Nexa, Kondalampatti Bypass" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>City</Label>
                            <Input defaultValue="Salem" />
                        </div>
                        <div className="space-y-2">
                            <Label>Pincode</Label>
                            <Input defaultValue="636010" />
                        </div>
                    </div>
                    <Button onClick={handleSave}>Save Profile</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Invoice Preferences</CardTitle>
                    <CardDescription>Configure default values for new invoices.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Default GST %</Label>
                        <Input type="number" defaultValue="0" className="max-w-[150px]" />
                        <p className="text-xs text-muted-foreground">Set to 0 if not applicable.</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Terms & Conditions</Label>
                        <Input defaultValue="Goods once sold cannot be returned." />
                    </div>
                    <Button variant="outline" onClick={handleSave}>Update Preferences</Button>
                </CardContent>
            </Card>

            <Card className="border-red-200">
                <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="destructive">Reset Database (Dev Only)</Button>
                </CardContent>
            </Card>
        </div>
    )
}
