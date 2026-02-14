import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ImageUpload } from './ImageUpload';
import dayjs from 'dayjs';
import { UserOutlined, CalendarOutlined, ManOutlined, WomanOutlined } from '@ant-design/icons';
import { AxiosError } from 'axios';

interface EditProfileModalProps {
    open: boolean;
    onCancel: () => void;
    user: {
        name: string;
        profilePhoto?: string;
        gender?: string;
        birthDate?: string;
    };
}

interface ProfileFormData {
    name: string;
    profilePhoto?: string;
    gender?: string;
    birthDate?: dayjs.Dayjs;
}

export default function EditProfileModal({ open, onCancel, user }: EditProfileModalProps) {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    // Reset form when modal opens or user data changes
    useEffect(() => {
        if (open && user) {
            form.setFieldsValue({
                name: user?.name,
                profilePhoto: user?.profilePhoto,
                gender: user?.gender,
                birthDate: user?.birthDate ? dayjs(user.birthDate) : undefined,
            });
        }
    }, [open, user, form]);

    const updateProfileMutation = useMutation({
        mutationFn: async (values: ProfileFormData) => {
            const payload = {
                ...values,
                birthDate: values.birthDate ? values.birthDate.toISOString() : undefined,
            };
            return api.patch('/users/profile', payload);
        },
        onSuccess: () => {
            message.success('Profile updated successfully');
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            onCancel();
        },
        onError: (error: AxiosError<{ message: string }>) => {
            message.error(error.response?.data?.message || 'Failed to update profile');
        },
    });

    const handleSubmit = async (values: ProfileFormData) => {
        updateProfileMutation.mutate(values);
    };

    return (
        <Modal
            title="Edit Profile"
            open={open}
            onCancel={onCancel}
            footer={null}
            destroyOnHidden
            centered
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    gender: 'other' // Default fallback
                }}
                className="pt-4"
            >
                <Form.Item
                    name="profilePhoto"
                    label="Profile Photo"
                >
                    <ImageUpload
                        folder="profile_photos"
                        label=""
                    />
                </Form.Item>

                <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[{ required: true, message: 'Please enter your name' }]}
                >
                    <Input prefix={<UserOutlined className="text-muted-foreground" />} placeholder="John Doe" />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="gender"
                        label="Gender"
                    >
                        <Select placeholder="Select gender">
                            <Select.Option value="male"><ManOutlined /> Male</Select.Option>
                            <Select.Option value="female"><WomanOutlined /> Female</Select.Option>
                            <Select.Option value="other"><UserOutlined /> Other</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="birthDate"
                        label="Birth Date"
                    >
                        <DatePicker
                            className="w-full"
                            format="YYYY-MM-DD"
                            placeholder="Select date"
                            suffixIcon={<CalendarOutlined />}
                        />
                    </Form.Item>
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border/50">
                    <Button onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={updateProfileMutation.isPending}
                    >
                        Save Changes
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}
