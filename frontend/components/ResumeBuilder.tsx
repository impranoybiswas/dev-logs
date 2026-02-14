'use client';

import React, { useState, useRef } from 'react';
import { Card, Button, Form, Input, Divider, Row, Col, message, Tabs } from 'antd';
import { PlusOutlined, MinusCircleOutlined, DownloadOutlined, UserOutlined, BookOutlined, RocketOutlined, ToolOutlined, SaveOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api from '@/lib/api';

const { TextArea } = Input;

interface ResumeData {
    personal: { name: string; email: string; phone: string; summary: string };
    education: { school: string; degree: string; year: string }[];
    experience: { company: string; position: string; duration: string; description: string }[];
    skills: { name: string }[];
}

const PersonalForm = () => (
    <div className="space-y-4">
        <Row gutter={16}>
            <Col span={24}>
                <Form.Item name={['personal', 'name']} label="Full Name" rules={[{ required: true }]}>
                    <Input placeholder="John Doe" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name={['personal', 'email']} label="Email" rules={[{ type: 'email' }]}>
                    <Input placeholder="john@example.com" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name={['personal', 'phone']} label="Phone">
                    <Input placeholder="+1 234 567 890" />
                </Form.Item>
            </Col>
            <Col span={24}>
                <Form.Item name={['personal', 'summary']} label="Professional Summary">
                    <TextArea rows={4} placeholder="Brief summary of your career..." />
                </Form.Item>
            </Col>
        </Row>
    </div>
);

const EducationForm = () => (
    <Form.List name="education">
        {(fields, { add, remove }) => (
            <div className="space-y-4">
                {fields.map(({ key, name, ...restField }) => (
                    <Card key={key} size="small" extra={<MinusCircleOutlined onClick={() => remove(name)} className="text-error cursor-pointer" />}>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item {...restField} name={[name, 'school']} label="School/University" rules={[{ required: true }]}>
                                    <Input placeholder="Stanford University" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item {...restField} name={[name, 'degree']} label="Degree">
                                    <Input placeholder="B.Sc. Computer Science" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item {...restField} name={[name, 'year']} label="Year">
                                    <Input placeholder="2020 - 2024" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Education
                </Button>
            </div>
        )}
    </Form.List>
);

const ExperienceForm = () => (
    <Form.List name="experience">
        {(fields, { add, remove }) => (
            <div className="space-y-4">
                {fields.map(({ key, name, ...restField }) => (
                    <Card key={key} size="small" extra={<MinusCircleOutlined onClick={() => remove(name)} className="text-error cursor-pointer" />}>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item {...restField} name={[name, 'company']} label="Company" rules={[{ required: true }]}>
                                    <Input placeholder="Google" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item {...restField} name={[name, 'position']} label="Position">
                                    <Input placeholder="Software Engineer" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item {...restField} name={[name, 'duration']} label="Duration">
                                    <Input placeholder="Jan 2022 - Present" />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item {...restField} name={[name, 'description']} label="Description">
                                    <TextArea rows={3} placeholder="Key responsibilities and achievements..." />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Experience
                </Button>
            </div>
        )}
    </Form.List>
);

const SkillsForm = () => (
    <Form.List name="skills">
        {(fields, { add, remove }) => (
            <div className="space-y-4">
                {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="flex gap-2">
                        <Form.Item
                            {...restField}
                            name={[name, 'name']}
                            className="grow mb-0"
                            rules={[{ required: true, message: 'Skill name is required' }]}
                        >
                            <Input placeholder="Skill (e.g. React, Node.js)" />
                        </Form.Item>
                        <MinusCircleOutlined onClick={() => remove(name)} className="text-red-500 cursor-pointer mt-2" />
                    </div>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Skill
                </Button>
            </div>
        )}
    </Form.List>
);

export default function ResumeBuilder() {
    const [form] = Form.useForm();
    const resumeRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [resumeData, setResumeData] = useState<ResumeData>({
        personal: { name: '', email: '', phone: '', summary: '' },
        education: [],
        experience: [],
        skills: []
    });

    React.useEffect(() => {
        const fetchResume = async () => {
            try {
                const response = await api.get('/resume');
                if (response.data) {
                    const newData = {
                        personal: {
                            name: response.data.user?.name || '',
                            email: response.data.user?.email || '',
                            phone: response.data.user?.phone || '',
                            summary: response.data.summary || '',
                        },
                        education: response.data.education || [],
                        experience: response.data.experience || [],
                        skills: response.data.skills || [],
                    };
                    setResumeData(newData);
                    form.setFieldsValue(newData);
                }
            } catch (error) {
                console.error('Failed to fetch resume:', error);
                // Optionally fetch basic user info if resume doesn't exist
                try {
                    const userRes = await api.get('/users/profile');
                    setResumeData(prev => ({
                        ...prev,
                        personal: {
                            ...prev.personal,
                            name: userRes.data.name,
                            email: userRes.data.email,
                            phone: userRes.data.phone || '', // Handle if phone is missing in user profile
                        }
                    }));
                } catch (e) {
                    console.error("Failed to fetch user profile", e);
                }
            }
        };
        fetchResume();
    }, [form]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/resume', resumeData);
            message.success('Resume saved successfully!');
        } catch (error) {
            console.error('Failed to save resume:', error);
            message.error('Failed to save resume');
        } finally {
            setSaving(false);
        }
    };

    const handleValuesChange = (_: unknown, allValues: ResumeData) => {
        setResumeData(allValues);
    };

    const generatePDF = async () => {
        if (!resumeRef.current) return;
        setLoading(true);
        try {
            const canvas = await html2canvas(resumeRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('resume.pdf');
            message.success('Resume downloaded successfully!');
        } catch (error) {
            console.error('PDF Generation Error:', error);
            message.error('Failed to generate PDF');
        } finally {
            setLoading(false);
        }
    };

    const tabItems = [
        { key: '1', label: <span><UserOutlined />Personal</span>, children: <PersonalForm /> },
        { key: '2', label: <span><BookOutlined />Education</span>, children: <EducationForm /> },
        { key: '3', label: <span><RocketOutlined />Experience</span>, children: <ExperienceForm /> },
        { key: '4', label: <span><ToolOutlined />Skills</span>, children: <SkillsForm /> },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-100px)]">
            {/* Editor Section */}
            <Card className="flex-1 lg:max-w-md h-fit shadow-lg overflow-y-auto max-h-[85vh] sticky top-24" title="Resume Editor">
                <Form
                    form={form}
                    layout="vertical"
                    onValuesChange={handleValuesChange}
                    initialValues={resumeData}
                >
                    <Tabs defaultActiveKey="1" items={tabItems} />
                </Form>
                <Divider />
                <div className="flex gap-2">
                    <Button type="default" size="large" block icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
                        Save
                    </Button>
                    <Button type="primary" size="large" block icon={<DownloadOutlined />} onClick={generatePDF} loading={loading}>
                        Export PDF
                    </Button>
                </div>
            </Card>

            {/* Preview Section */}
            <div className="flex-1 flex justify-center bg-muted/20 p-4 rounded-xl overflow-auto">
                <div
                    ref={resumeRef}
                    className="bg-white w-[210mm] min-h-[297mm] p-[20mm] shadow-xl text-black"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                >
                    {/* Header */}
                    <div className="border-b-2 border-gray-800 pb-4 mb-6">
                        <h1 className="text-4xl font-bold uppercase tracking-wider mb-2 text-gray-900">
                            {resumeData.personal?.name || 'Your Name'}
                        </h1>
                        <div className="flex gap-4 text-sm text-gray-600 flex-wrap">
                            {resumeData.personal?.email && <span>{resumeData.personal.email}</span>}
                            {resumeData.personal?.phone && <span>• {resumeData.personal.phone}</span>}
                        </div>
                    </div>

                    {/* Summary */}
                    {resumeData.personal?.summary && (
                        <div className="mb-6">
                            <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1 text-gray-800">Professional Summary</h2>
                            <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">{resumeData.personal.summary}</p>
                        </div>
                    )}

                    {/* Experience */}
                    {resumeData.experience?.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1 text-gray-800">Experience</h2>
                            <div className="space-y-4">
                                {resumeData.experience?.map((exp, index) => (
                                    <div key={index}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold text-gray-900">{exp?.position}</h3>
                                            <span className="text-sm text-gray-600 font-medium">{exp?.duration}</span>
                                        </div>
                                        <div className="text-gray-700 font-medium mb-1">{exp?.company}</div>
                                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{exp?.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {resumeData.education?.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1 text-gray-800">Education</h2>
                            <div className="space-y-3">
                                {resumeData.education?.map((edu, index) => (
                                    <div key={index}>
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-bold text-gray-900">{edu?.school}</h3>
                                            <span className="text-sm text-gray-600">{edu?.year}</span>
                                        </div>
                                        <div className="text-gray-700">{edu?.degree}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Skills */}
                    {resumeData.skills?.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1 text-gray-800">Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {resumeData.skills?.map((skill, index) => (
                                    <span key={index} className="bg-gray-200 px-3 py-1 rounded text-sm text-gray-800 font-medium">
                                        {skill?.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
