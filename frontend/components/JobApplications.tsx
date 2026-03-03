"use client";

import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Typography,
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
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import api from "@/lib/api";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;
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
      const payload = {
        ...values,
        appliedAt: values.appliedAt.toISOString(),
      };
      if (editingJob) {
        return api.patch(`/job-applications/${editingJob.id}`, payload);
      }
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
    mutationFn: async (id: string) => {
      return api.delete(`/job-applications/${id}`);
    },
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
    form.setFieldsValue({
      ...job,
      appliedAt: dayjs(job.appliedAt),
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const onFinish = (
    values: Omit<JobApplication, "id"> & { appliedAt: dayjs.Dayjs },
  ) => {
    mutation.mutate(values);
  };

  const columns = [
    {
      title: "#",
      key: "serial",
      width: 60,
      render: (_: unknown, __: JobApplication, index: number) => (
        <span>{index + 1}</span>
      ),
    },
    {
      title: "Company",
      dataIndex: "company",
      key: "company",
      render: (text: string) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={statusColors[status] || "default"}>{status}</Tag>
      ),
    },
    {
      title: "Applied Date",
      dataIndex: "appliedAt",
      key: "appliedAt",
      render: (date: string) => dayjs(date).format("MMMM D, YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: JobApplication) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="text"
          />
          <Popconfirm
            title="Delete job application?"
            description="Are you sure you want to delete this application?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger type="text" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space size="middle" className="flex-wrap">
          <Input.Search
            placeholder="Search company or role"
            onSearch={setSearchText}
            allowClear
            style={{ width: 250 }}
          />
          <Select
            placeholder="Filter by status"
            allowClear
            style={{ width: 150 }}
            onChange={setStatusFilter}
          >
            <Option value="Pending">Pending</Option>
            <Option value="Interviewing">Interviewing</Option>
            <Option value="Accepted">Accepted</Option>
            <Option value="Rejected">Rejected</Option>
          </Select>
        </Space>
      }
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Job
        </Button>
      }
      className="mt-6"
    >
      <Table
        columns={columns}
        dataSource={jobs}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 5 }}
        locale={{ emptyText: "No job applications added yet." }}
        expandable={{
          expandedRowRender: (record) => (
            <p style={{ margin: 0 }}>
              <InfoCircleOutlined className="mr-2 text-blue-400" />
              <strong>Notes: </strong> {record.notes || "No notes provided."}
            </p>
          ),
          rowExpandable: (record) => !!record.notes,
        }}
      />

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
          onFinish={onFinish}
          initialValues={{ status: "Pending", appliedAt: dayjs() }}
        >
          <Form.Item
            name="company"
            label="Company"
            rules={[
              { required: true, message: "Please input the company name" },
            ]}
          >
            <Input placeholder="e.g. Google, Meta" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please input the role" }]}
          >
            <Input placeholder="e.g. Frontend Developer" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select a status" }]}
          >
            <Select>
              <Option value="Pending">Pending</Option>
              <Option value="Interviewing">Interviewing</Option>
              <Option value="Accepted">Accepted</Option>
              <Option value="Rejected">Rejected</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="appliedAt"
            label="Applied Date"
            rules={[
              { required: true, message: "Please select the applied date" },
            ]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item name="notes" label="Notes (Optional)">
            <TextArea
              rows={3}
              placeholder="Add any details about the application process"
            />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
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
    </Card>
  );
}
