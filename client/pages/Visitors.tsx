import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { UserCheck, Plus, Clock, LogOut } from "lucide-react";
import { Visitor } from "@shared/api";

export default function Visitors() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/visitors");
        if (!response.ok) {
          throw new Error("Failed to fetch visitors");
        }
        const data = await response.json();
        setVisitors(data);
      } catch (error) {
        console.error("Error fetching visitors:", error);
        setError("Failed to load visitors");
      } finally {
        setLoading(false);
      }
    };

    fetchVisitors();
  }, []);

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    return status === "checked_in" ? "default" : "secondary";
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Visitor Management</h1>
          </div>
        </header>

        <div className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Visitors</h2>
              <p className="text-muted-foreground">
                Track and manage visitor check-ins and check-outs.
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Check-in Visitor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Check-in New Visitor</DialogTitle>
                  <DialogDescription>
                    Enter visitor details for security records.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="visitorName" className="text-right">
                      Full Name
                    </Label>
                    <Input
                      id="visitorName"
                      placeholder="John Doe"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="visitorPhone" className="text-right">
                      Phone Number
                    </Label>
                    <Input
                      id="visitorPhone"
                      placeholder="+254 712 345 678"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="studentId" className="text-right">
                      Student ID
                    </Label>
                    <Input
                      id="studentId"
                      placeholder="ST001"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="idProof" className="text-right">
                      ID Proof
                    </Label>
                    <Input
                      id="idProof"
                      placeholder="Kenyan ID / Passport"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="purpose" className="text-right">
                      Purpose
                    </Label>
                    <Textarea
                      id="purpose"
                      placeholder="Parent visit, academic meeting, etc."
                      className="col-span-3"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Check In</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Visitor Statistics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Currently Inside
                </CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {visitors.filter((v) => v.status === "checked_in").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Today's Visits
                </CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{visitors.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Checked Out
                </CardTitle>
                <LogOut className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {visitors.filter((v) => v.status === "checked_out").length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visitor List */}
          <Card>
            <CardHeader>
              <CardTitle>Visitor Log</CardTitle>
              <CardDescription>
                Current and recent visitor activity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Check-in Time</TableHead>
                    <TableHead>Check-out Time</TableHead>
                    <TableHead>ID Proof</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center">
                        Loading visitors...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-red-500">
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : visitors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center">
                        No visitors found
                      </TableCell>
                    </TableRow>
                  ) : (
                    visitors.map((visitor) => (
                      <TableRow key={visitor.id}>
                        <TableCell className="font-medium">{visitor.name}</TableCell>
                        <TableCell>{visitor.phone}</TableCell>
                        <TableCell>{visitor.purpose}</TableCell>
                        <TableCell>{visitor.studentId}</TableCell>
                        <TableCell>{formatTime(visitor.checkInTime)}</TableCell>
                        <TableCell>
                          {visitor.checkOutTime ? formatTime(visitor.checkOutTime) : "-"}
                        </TableCell>
                        <TableCell>{visitor.idProof}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(visitor.status)}>
                            {visitor.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {visitor.status === "checked_in" ? (
                            <Button variant="outline" size="sm">
                              <LogOut className="h-4 w-4 mr-1" />
                              Check Out
                            </Button>
                          ) : (
                            <span className="text-muted-foreground">Checked Out</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
