"use client";

import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  DatePicker,
  Tag,
} from "antd";
import { message } from "@/lib/antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import api from "@/lib/api";
import dayjs from "dayjs";
import { motion } from "framer-motion";

const { TextArea } = Input;

interface JobApplication {
  id: string;
  company: string;
  role: string;
  status: string;
  appliedAt: string;
  notes?: string;
}

const statusColors: Record<string, string> = {
  Pending: "var(--color-warning)",
  Interviewing: "var(--color-primary)",
  Accepted: "var(--color-success)",
  Rejected: "var(--color-error)",
};

const STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "Interviewing", label: "Interviewing" },
  { value: "Accepted", label: "Accepted" },
  { value: "Rejected", label: "Rejected" },
];

export default function JobApplications() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined,
  );
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery<JobApplication[]>({
    queryKey: ["job-applications", searchText, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchText) params.append("search", searchText);
      if (statusFilter) params.append("status", statusFilter);
      const response = await api.get(`/job-applications?${params.toString()}`);
      return response.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (
      values: Omit<JobApplication, "id"> & { appliedAt: dayjs.Dayjs },
    ) => {
      const payload = { ...values, appliedAt: values.appliedAt.toISOString() };
      if (editingJob)
        return api.patch(`/job-applications/${editingJob.id}`, payload);
      return api.post("/job-applications", payload);
    },
    onSuccess: () => {
      message.success(
        `Job application ${editingJob ? "updated" : "added"} successfully`,
      );
      setIsModalOpen(false);
      form.resetFields();
      setEditingJob(null);
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      message.error(error.response?.data?.message || "Operation failed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/job-applications/${id}`),
    onSuccess: () => {
      message.success("Job application deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
    },
  });

  const handleAdd = () => {
    setEditingJob(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (job: JobApplication) => {
    setEditingJob(job);
    form.setFieldsValue({ ...job, appliedAt: dayjs(job.appliedAt) });
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: "Company",
      dataIndex: "company",
      key: "company",
      render: (text: string) => (
        <span className="font-bold text-foreground tracking-tight">{text}</span>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (text: string) => (
        <span className="font-medium text-muted-foreground">{text}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          bordered={false}
          style={{
            background: `${statusColors[status]}20`,
            color: statusColors[status],
          }}
          className="font-bold uppercase text-[10px] tracking-widest px-2.5 py-0.5 rounded-full"
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "appliedAt",
      key: "appliedAt",
      render: (date: string) => (
        <span className="text-xs font-semibold text-muted-foreground/80">
          {dayjs(date).format("MMM DD, YYYY")}
        </span>
      ),
    },
    {
      title: "",
      key: "actions",
      fixed: "right" as const,
      width: 100,
      render: (_: unknown, record: JobApplication) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="text"
            className="hover:text-primary transition-colors flex items-center justify-center"
          />
          <Popconfirm
            title="Delete application?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true, className: "rounded-lg" }}
            cancelButtonProps={{ className: "rounded-lg" }}
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              type="text"
              className="flex items-center justify-center"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ── Toolbar: Search + Filter + Add ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-4 bg-card/40 p-1 rounded-2xl border"
      >
        <Input
          prefix={<SearchOutlined className="text-muted-foreground ml-1" />}
          placeholder="Search company..."
          allowClear
          className="flex-1 min-w-48 h-12 rounded-xl bg-transparent border-none! shadow-none!"
          onChange={(e) => {
            if (!e.target.value) setSearchText("");
          }}
          onPressEnter={(e) =>
            setSearchText((e.target as HTMLInputElement).value)
          }
          onBlur={(e) => setSearchText(e.target.value)}
        />

        <div className="h-6 w-px bg-border hidden md:block" />

        <Select
          prefix={<FilterOutlined className="text-muted-foreground" />}
          placeholder="Status"
          allowClear
          variant="borderless"
          className="min-w-32 h-12 flex items-center"
          onChange={setStatusFilter}
          options={STATUS_OPTIONS}
        />

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          className="h-12! px-6! rounded-xl! bg-primary! hover:bg-primary-hover! border-none shadow-lg! shadow-primary/20 font-bold! tracking-tight!"
        >
          Add New Job
        </Button>
      </motion.div>

      {/* ── Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full overflow-hidden rounded-3xl border border-border glass shadow-2xl! shadow-black/5"
      >
        <Table
          columns={columns}
          dataSource={jobs}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 8,
            showSizeChanger: false,
            className: "px-6!",
          }}
          locale={{ emptyText: "No applications found. Time to apply!" }}
          scroll={{ x: "max-content" }}
          className="premium-table"
          expandable={{
            expandedRowRender: (record) => (
              <div className="px-6 py-4 bg-primary/5 rounded-2xl mx-6 mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-primary block mb-2">
                  Notes
                </span>
                <p className="m-0 text-sm text-foreground/80 leading-relaxed">
                  {record.notes ||
                    "No detailed notes provided for this application."}
                </p>
              </div>
            ),
            rowExpandable: (record) => !!record.notes,
            expandIcon: ({ expanded, onExpand, record }) =>
              record.notes ? (
                <InfoCircleOutlined
                  className={`cursor-pointer transition-colors ${expanded ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                  onClick={(e) => onExpand(record, e)}
                />
              ) : null,
          }}
        />
      </motion.div>

      {/* ── Add / Edit Modal ── */}
      <Modal
        title={
          <span className="text-xl font-black tracking-tighter">
            {editingJob ? "Update Application" : "New Application"}
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnHidden
        centered
        className="premium-modal"
        rootClassName="backdrop-blur-sm"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => mutation.mutate(values)}
          initialValues={{ status: "Pending", appliedAt: dayjs() }}
          className="pt-4 space-y-4"
          size="large"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="company"
              label={
                <span className="font-bold text-xs uppercase tracking-widest">
                  Company
                </span>
              }
              rules={[{ required: true, message: "Enter company name" }]}
            >
              <Input placeholder="e.g. Google" className="rounded-xl!" />
            </Form.Item>

            <Form.Item
              name="role"
              label={
                <span className="font-bold text-xs uppercase tracking-widest">
                  Role
                </span>
              }
              rules={[{ required: true, message: "Enter role" }]}
            >
              <Input placeholder="e.g. Frontend Dev" className="rounded-xl!" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="status"
              label={
                <span className="font-bold text-xs uppercase tracking-widest">
                  Status
                </span>
              }
              rules={[{ required: true, message: "Select status" }]}
            >
              <Select options={STATUS_OPTIONS} className="rounded-xl!" />
            </Form.Item>

            <Form.Item
              name="appliedAt"
              label={
                <span className="font-bold text-xs uppercase tracking-widest">
                  Applied Date
                </span>
              }
              rules={[{ required: true, message: "Select date" }]}
            >
              <DatePicker className="w-full rounded-xl!" />
            </Form.Item>
          </div>

          <Form.Item
            name="notes"
            label={
              <span className="font-bold text-xs uppercase tracking-widest">
                Notes
              </span>
            }
          >
            <TextArea
              rows={3}
              placeholder="Application details, contact person, etc."
              className="rounded-xl!"
            />
          </Form.Item>

          <Form.Item className="mb-0 pt-4 flex justify-end">
            <Space size="middle">
              <Button
                onClick={() => setIsModalOpen(false)}
                className="h-12! px-8! rounded-xl! font-bold!"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={mutation.isPending}
                className="h-12! px-10! rounded-xl! bg-primary! border-none! font-bold! shadow-lg! shadow-primary/20"
              >
                {editingJob ? "Update Job" : "Save Job"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <style jsx global>{`
        .premium-table .ant-table {
          background: transparent !important;
        }
        .premium-table .ant-table-thead > tr > th {
          background: var(--color-muted) !important;
          color: var(--color-muted-foreground) !important;
          font-weight: 800;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-bottom: 1px solid var(--border) !important;
          padding: 16px 24px !important;
        }
        .premium-table .ant-table-tbody > tr > td {
          padding: 16px 24px !important;
          border-bottom: 1px solid
            var(--border-rgb, rgba(var(--border-rgb), 0.1)) !important;
          transition: background 0.3s ease;
        }
        .premium-table .ant-table-tbody > tr:hover > td {
          background: var(
            --color-primary-rgb,
            rgba(99, 102, 241, 0.03)
          ) !important;
        }
        .premium-table .ant-pagination {
          margin: 16px 0 !important;
        }
        .premium-modal .ant-modal-content {
          border-radius: 24px !important;
          padding: 24px !important;
          border: 1px solid var(--border);
          background: var(--background);
        }
        .premium-modal .ant-modal-header {
          background: transparent !important;
          border-bottom: none !important;
          margin-bottom: 0 !important;
        }
      `}</style>
    </div>
  );
}
