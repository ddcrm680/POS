import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function UserList() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // MODALS
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState<any>(null);

  // ADD FORM
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    role_id: "",
  });

  // EDIT FORM
  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    role_id: "",
  });

  // ------------------------------------------------
  // Fetch Roles
  // ------------------------------------------------
  const fetchRoles = async () => {
    try {
      const res = await api.get("/api/utility/roles");
      setRoles(res.data.data || []);
    } catch {
      setRoles([]);
    }
  };

  // ------------------------------------------------
  // Fetch Users
  // ------------------------------------------------
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/api/admin/users?page=${page}&search=${search}`
      );
      const body = res.data;

      setUsers(body.data || []);
      setLastPage(body.last_page || 1);
    } catch (err) {
      console.log("User fetch failed:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  // ------------------------------------------------
  // Add User
  // ------------------------------------------------
  const saveUser = async () => {
    try {
      const res = await api.post("/api/admin/add-user", addForm);
      toast({ title: "User added successfully" });
      setShowAddModal(false);
      fetchUsers();
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Failed to add user",
        variant: "destructive",
      });
    }
  };

  // ------------------------------------------------
  // Update User
  // ------------------------------------------------
  const updateUser = async () => {
    try {
      await api.post(`/api/admin/update-user/${editForm.id}`, editForm);
      toast({ title: "User updated successfully" });
      setShowEditModal(false);
      fetchUsers();
    } catch (err: any) {
      toast({
        title: "Error updating user",
        description: err.response?.data?.message,
        variant: "destructive",
      });
    }
  };

  // ------------------------------------------------
  // Status Toggle — API later
  // ------------------------------------------------
const toggleStatus = async (user: any) => {
  try {
    const newStatus = user.is_active ? 0 : 1;

    await api.post(`/api/admin/user/status/${user.id}`, {
      status: newStatus,
    });

    toast({ title: "Status updated" });

    // Update UI state
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, is_active: newStatus } : u
      )
    );
  } catch {
    toast({
      title: "Status update failed",
      variant: "destructive",
    });
  }
};

  // ------------------------------------------------
  // Modal Handlers
  // ------------------------------------------------
  const openView = (user: any) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const openEdit = (user: any) => {
    setSelectedUser(user);
    setEditForm({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address || "",
      role_id: user.role_id,
    });
    setShowEditModal(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Official Accounts
          </h1>
          <p className="text-gray-600">Manage your users</p>
        </div>

        <Button onClick={() => setShowAddModal(true)}>➕ Add User</Button>
      </div>

      {/* Search */}
      <div className="flex justify-between mb-5">
        <Input
          className="w-60"
          placeholder="Search name or phone..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3">Created</th>
              <th className="p-3">Role</th>
              <th className="p-3">User Info</th>
              <th className="p-3">Address</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-4 text-center">
                  Loading…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="p-3 whitespace-nowrap">
                    {u.created_at?.slice(0, 10)} <br />
                    <span className="text-xs text-gray-500">
                      {u.created_at?.slice(11, 16)}
                    </span>
                  </td>

                  <td className="p-3">{u.role?.slug}</td>

                  <td className="p-3">
                    <div className="font-semibold">{u.name}</div>
                    <div className="text-gray-600">{u.email}</div>
                    <div className="text-gray-600">{u.phone}</div>
                  </td>

                  <td className="p-3">{u.address || "-"}</td>

                  <td className="p-3">
                    <Switch
                      checked={u.is_active === 1}
                      onCheckedChange={() => toggleStatus(u)}
                    />
                  </td>

                  <td className="p-3 flex gap-2">
                    <Button size="sm" onClick={() => openView(u)}>
                      👁️
                    </Button>

                    <Button size="sm" onClick={() => openEdit(u)}>
                      ✏️
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </Button>

        <span>
          Page {page} of {lastPage}
        </span>

        <Button
          disabled={page === lastPage}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>

      {/* ADD USER MODAL */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              placeholder="Full Name"
              value={addForm.name}
              onChange={(e) =>
                setAddForm({ ...addForm, name: e.target.value })
              }
            />

            <Input
              placeholder="Email"
              value={addForm.email}
              onChange={(e) =>
                setAddForm({ ...addForm, email: e.target.value })
              }
            />

            <Input
              placeholder="Phone"
              value={addForm.phone}
              onChange={(e) =>
                setAddForm({ ...addForm, phone: e.target.value })
              }
            />

            <Textarea
              placeholder="Address"
              className="min-h-[80px]"
              value={addForm.address}
              onChange={(e) =>
                setAddForm({ ...addForm, address: e.target.value })
              }
            />

            <Input
              placeholder="Password"
              type="password"
              value={addForm.password}
              onChange={(e) =>
                setAddForm({ ...addForm, password: e.target.value })
              }
            />

            <select
              className="border p-2 rounded w-full"
              value={addForm.role_id}
              onChange={(e) =>
                setAddForm({ ...addForm, role_id: e.target.value })
              }
            >
              <option value="">Select Role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.slug}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <Button onClick={saveUser}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-3">
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />

              <Input
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
              />

              <Input
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
              />

              <Textarea
                placeholder="Address"
                className="min-h-[80px]"
                value={editForm.address}
                onChange={(e) =>
                  setEditForm({ ...editForm, address: e.target.value })
                }
              />

              <select
                className="border p-2 rounded w-full"
                value={editForm.role_id}
                onChange={(e) =>
                  setEditForm({ ...editForm, role_id: e.target.value })
                }
              >
                <option value="">Select Role</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <DialogFooter>
            <Button onClick={updateUser}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VIEW MODAL */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {selectedUser.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedUser.phone}
              </p>
              <p>
                <strong>Role:</strong> {selectedUser.role?.slug}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {selectedUser.is_active === 1 ? "Active" : "Inactive"}
              </p>
              <p>
                <strong>Address:</strong> {selectedUser.address || "-"}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowViewModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
