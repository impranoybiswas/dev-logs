'use client';

import React, { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, Typography, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, GlobalOutlined, LinkedinOutlined, GithubOutlined, FacebookOutlined, InstagramOutlined, WhatsAppOutlined, MessageOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/lib/api';

const { Title } = Typography;
const { Option } = Select;

interface SocialLink {
    id: string;
    name: string;
    url: string;
}

const platformIcons: Record<string, React.ReactNode> = {
    linkedin: <LinkedinOutlined className="text-blue-600" />,
    github: <GithubOutlined className="text-gray-800" />,
    facebook: <FacebookOutlined className="text-blue-700" />,
    instagram: <InstagramOutlined className="text-pink-600" />,
    discord: <MessageOutlined className="text-indigo-500" />,
    whatsapp: <WhatsAppOutlined className="text-green-500" />,
    other: <GlobalOutlined />
};

const platforms = [
    { label: 'LinkedIn', value: 'linkedin' },
    { label: 'GitHub', value: 'github' },
    { label: 'Facebook', value: 'facebook' },
    { label: 'Instagram', value: 'instagram' },
    { label: 'Discord', value: 'discord' },
    { label: 'WhatsApp', value: 'whatsapp' },
];

export default function SocialLinks() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data: links, isLoading } = useQuery<SocialLink[]>({
        queryKey: ['social-links'],
        queryFn: async () => {
            const response = await api.get('/social-links');
            return response.data;
        },
    });

    const mutation = useMutation({
        mutationFn: async (values: { name: string; url: string }) => {
            if (editingLink) {
                return api.patch(`/social-links/${editingLink.id}`, values);
            }
            return api.post('/social-links', values);
        },
        onSuccess: () => {
            message.success(`Social link ${editingLink ? 'updated' : 'added'} successfully`);
            setIsModalOpen(false);
            form.resetFields();
            setEditingLink(null);
            queryClient.invalidateQueries({ queryKey: ['social-links'] });
        },
        onError: (error: AxiosError<{ message: string }>) => {
            message.error(error.response?.data?.message || 'Operation failed');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/social-links/${id}`);
        },
        onSuccess: () => {
            message.success('Social link deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['social-links'] });
        },
    });

    const handleAdd = () => {
        setEditingLink(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (link: SocialLink) => {
        setEditingLink(link);
        form.setFieldsValue({
            name: link.name.toLowerCase(),
            url: link.url
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id);
    };

    const onFinish = (values: { name: string; url: string }) => {
        // Find the label for the selected value to store as name
        const platform = platforms.find(p => p.value === values.name);
        mutation.mutate({
            ...values,
            name: platform ? platform.label : values.name
        });
    };

    const columns = [
        {
            title: 'Platform',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => (
                <Space>
                    {platformIcons[text.toLowerCase()] || <GlobalOutlined />}
                    <span className="capitalize">{text}</span>
                </Space>
            ),
        },
        {
            title: 'URL',
            dataIndex: 'url',
            key: 'url',
            render: (url: string) => (
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 truncate max-w-xs block">
                    {url}
                </a>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: SocialLink) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        type="text"
                    />
                    <Popconfirm
                        title="Delete social link?"
                        description="Are you sure you want to delete this link?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            icon={<DeleteOutlined />}
                            danger
                            type="text"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card
            title={<Title level={4} className="m-0">Social Links</Title>}
            extra={
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Add Link
                </Button>
            }
            className="mt-6"
        >
            <Table
                columns={columns}
                dataSource={links}
                rowKey="id"
                loading={isLoading}
                pagination={false}
                locale={{ emptyText: 'No social links added yet.' }}
            />

            <Modal
                title={editingLink ? "Edit Social Link" : "Add Social Link"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{ name: 'linkedin' }}
                >
                    <Form.Item
                        name="name"
                        label="Platform"
                        rules={[{ required: true, message: 'Please select a platform' }]}
                    >
                        <Select placeholder="Select platform">
                            {platforms.map(p => (
                                <Option key={p.value} value={p.value}>{p.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="url"
                        label="URL"
                        rules={[
                            { required: true, message: 'Please input the URL' },
                            { type: 'url', message: 'Please enter a valid URL' }
                        ]}
                    >
                        <Input placeholder="https://..." />
                    </Form.Item>

                    <Form.Item className="mb-0 text-right">
                        <Space>
                            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={mutation.isPending}>
                                {editingLink ? 'Update' : 'Add'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
}
