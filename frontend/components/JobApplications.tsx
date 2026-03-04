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
  Pending: "gold",
  Interviewing: "blue",
  Accepted: "green",
  Rejected: "red",
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
      title: "#",
      key: "serial",
      width: 52,
      render: (_: unknown, __: JobApplication, index: number) => (
        <span className="text-muted-foreground text-xs font-bold">
          {index + 1}
        </span>
      ),
    },
    {
      title: "Company",
      dataIndex: "company",
      key: "company",
      render: (text: string) => (
        <span className="font-bold whitespace-nowrap">{text}</span>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (text: string) => (
        <span className="whitespace-nowrap">{text}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={statusColors[status] || "default"}
          className="font-semibold uppercase text-xs tracking-wide"
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Applied Date",
      dataIndex: "appliedAt",
      key: "appliedAt",
      render: (date: string) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {dayjs(date).format("MMM D, YYYY")}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right" as const,
      width: 90,
      render: (_: unknown, record: JobApplication) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="text"
            size="small"
          />
          <Popconfirm
            title="Delete this application?"
            description="This action cannot be undone."
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button icon={<DeleteOutlined />} danger type="text" size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* ── Toolbar: Search + Filter + Add ── */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          prefix={<SearchOutlined className="text-muted-foreground" />}
          placeholder="Search company or role..."
          allowClear
          className="flex-1 min-w-48 max-w-xs"
          onChange={(e) => {
            if (!e.target.value) setSearchText("");
          }}
          onPressEnter={(e) =>
            setSearchText((e.target as HTMLInputElement).value)
          }
          onBlur={(e) => setSearchText(e.target.value)}
        />

        <Select
          prefix={<FilterOutlined className="text-muted-foreground" />}
          placeholder="Filter by status"
          allowClear
          style={{ minWidth: 160 }}
          onChange={setStatusFilter}
          options={STATUS_OPTIONS}
        />

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          className="ml-auto"
        >
          Add Job
        </Button>
      </div>

      {/* ── Table ── */}
      <div className="w-full overflow-x-auto rounded-lg border border-border">
        <Table
          columns={columns}
          dataSource={jobs}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          locale={{ emptyText: "No job applications yet. Add one above!" }}
          scroll={{ x: "max-content" }}
          size="middle"
          style={{ margin: 0 }}
          className="jobs-table"
          expandable={{
            expandedRowRender: (record) => (
              <p className="m-0 text-sm text-muted-foreground">
                <InfoCircleOutlined className="mr-2 text-primary" />
                <strong className="text-foreground">Notes: </strong>
                {record.notes || "No notes provided."}
              </p>
            ),
            rowExpandable: (record) => !!record.notes,
          }}
        />
      </div>

      {/* ── Add / Edit Modal ── */}
      <Modal
        title={editingJob ? "Edit Job Application" : "Add Job Application"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => mutation.mutate(values)}
          initialValues={{ status: "Pending", appliedAt: dayjs() }}
          className="pt-2"
        >
          <Form.Item
            name="company"
            label="Company"
            rules={[
              { required: true, message: "Please enter the company name" },
            ]}
          >
            <Input placeholder="e.g. Google, Meta" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please enter the role" }]}
          >
            <Input placeholder="e.g. Frontend Developer" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select a status" }]}
          >
            <Select options={STATUS_OPTIONS} />
          </Form.Item>

          <Form.Item
            name="appliedAt"
            label="Applied Date"
            rules={[{ required: true, message: "Please select the date" }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item name="notes" label="Notes (Optional)">
            <TextArea
              rows={3}
              placeholder="Add any details about the application process"
            />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={mutation.isPending}
              >
                {editingJob ? "Update" : "Add"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <style jsx global>{`
        .jobs-table .ant-table {
          margin: 0 !important;
        }
        .jobs-table .ant-table-wrapper {
          border-radius: 0 !important;
        }
        .jobs-table .ant-table-container {
          border-radius: 0 !important;
        }
        .jobs-table .ant-table-thead > tr > th {
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: var(--color-muted) !important;
          color: var(--color-muted-foreground) !important;
          border-bottom: 1px solid var(--border) !important;
          padding: 10px !important;
        }
        .jobs-table .ant-table-tbody > tr > td {
          padding: 10px !important;
          border-bottom: 1px solid var(--border) !important;
        }
        .jobs-table .ant-table-tbody > tr:first-child > td {
          border-bottom: none !important;
        }
        .jobs-table .ant-table-tbody > tr:hover > td {
          background: var(--color-muted) !important;
        }
      `}</style>
    </div>
  );
}
