import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Pagination,
  Space,
  Table,
  Tag,
} from "antd";
import { useEffect, useState } from "react";
import useDebounce from "../hooks/useDebounce";
import {
  createLibrary,
  deleteLibrary,
  searchAndPagingLibraries,
  updateLibrary,
} from "../../apis/library.api";

export default function LibraryManager() {
  const [form] = Form.useForm();
  const [libraries, setLibraries] = useState([]);
  const [inputSearch, setInputSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isShowModalDelete, setIsShowModalDelete] = useState(false);
  const [baseId, setBaseId] = useState(null);
  const [isShowModalAdd, setIsShowModalAdd] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecord, setTotalRecord] = useState(0);
  const [libraryInfo, setLibraryInfo] = useState(null);

  useEffect(() => {
    form.setFieldsValue(libraryInfo);
  }, [libraryInfo, form]);

  const debouceSearchValue = useDebounce(inputSearch, 300);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const libraryResponse = await searchAndPagingLibraries(
        debouceSearchValue,
        currentPage,
        pageSize
      );

      setLibraries(libraryResponse.data);

      setTotalRecord(+libraryResponse.headers["x-total-count"]);
    } catch (error) {
      console.log("Có lỗi xảy ra. Vui lòng thử lại sau: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [debouceSearchValue, currentPage, pageSize]);

  const handleShowModalDelete = (id) => {
    setIsShowModalDelete(true);

    setBaseId(id);
  };

  const handleCloseModalDelete = () => {
    setIsShowModalDelete(false);

    setBaseId(null);
  };

  const handleDelete = async () => {
    try {
      const response = await deleteLibrary(baseId);

      if (response.status === 200) {
        message.success("Xóa thông tin thư viện thành công");

        handleCloseModalDelete();

        loadData();
      }
    } catch (error) {
      message.error("Xóa thông tin thư viện thất bại");
    }
  };

  const handleChangeInput = (event) => {
    setInputSearch(event.target.value);
  };

  const handleShowModalAdd = () => {
    setIsShowModalAdd(true);
  };

  const handleCloseModalAdd = () => {
    setIsShowModalAdd(false);

    setLibraryInfo(null);

    setBaseId(null);
  };

  const handleCreateLibrary = async (values) => {
    try {
      const newLibrary = {
        ...values,
        status: 0,
        createdAt: new Date(),
      };

      let response = null;

      if (libraryInfo) {
        response = await updateLibrary(baseId, values);
      } else {
        response = await createLibrary(newLibrary);
      }

      if (response.status === 201 || response.status === 200) {
        message.success(
          `${
            libraryInfo ? "Cập nhật" : "Thêm mới"
          } thông tin thư viện thành công`
        );

        handleCloseModalAdd();

        loadData();

        form.resetFields();
      }
    } catch (error) {
      message.error("Thêm thông tin thất bại");
    }
  };

  const handleChangePage = (currentPage, pageSize) => {
    setCurrentPage(currentPage);

    setPageSize(pageSize);
  };

  const handleGetInfo = (libraryInfo) => {
    handleShowModalAdd();

    setLibraryInfo(libraryInfo);

    setBaseId(libraryInfo.id);
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Tên sách",
      dataIndex: "bookName",
      key: "bookName",
    },
    {
      title: "Sinh viên mượn",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "Ngày mượn",
      dataIndex: "borrowedDay",
      key: "borrowedDay",
      render: (record) => formatDate(record),
    },
    {
      title: "Ngày trả",
      dataIndex: "paymentDate",
      key: "paymentDate",
      render: (record) => formatDate(record),
    },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      render: (record) => (
        <>
          {record === 1 ? (
            <Tag color="green">Đã trả</Tag>
          ) : (
            <Tag color="red">Chưa trả</Tag>
          )}
        </>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => handleGetInfo(record)}>Sửa</a>
          <a onClick={() => handleShowModalDelete(record.id)}>Xóa</a>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Modal
        onOk={handleDelete}
        onCancel={handleCloseModalDelete}
        title="Xác nhận xóa"
        okText="Xóa"
        cancelText="Hủy"
        open={isShowModalDelete}
      >
        <h3>Bạn có chắc chắn muốn xóa thông tin này?</h3>
      </Modal>

      <Modal
        footer={null}
        title={`${libraryInfo ? "Cập nhật" : "Thêm mới"} thông tin mượn sách`}
        open={isShowModalAdd}
        onCancel={handleCloseModalAdd}
      >
        <Form
          form={form}
          name="formLibrary"
          initialValues={{ remember: true }}
          onFinish={handleCreateLibrary}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label="Tên sách"
            name="bookName"
            rules={[
              { required: true, message: "Tên sách không được để trống" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Tên người mượn"
            name="studentName"
            rules={[
              { required: true, message: "Tên người mượn không được để trống" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Ngày mượn"
            name="borrowedDay"
            rules={[
              { required: true, message: "Ngày mượn không được để trống" },
            ]}
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item
            label="Ngày trả"
            name="paymentDate"
            rules={[
              { required: true, message: "Ngày trả không được để trống" },
            ]}
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item label={null}>
            <div className="flex justify-end gap-2">
              <Button onClick={handleCloseModalAdd} htmlType="button">
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {libraryInfo ? "Lưu" : "Thêm"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <div className="flex justify-center mt-[50px]">
        <div className="w-[80%]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-[24px]">Quản lý mượn trả sách</h3>
            <Button onClick={handleShowModalAdd} type="primary">
              Thêm thông tin
            </Button>
          </div>

          <div>
            <Input
              value={inputSearch}
              onChange={handleChangeInput}
              placeholder="Tìm kiếm theo tên sách..."
            />
          </div>

          <div className="my-5">
            <Table
              loading={isLoading}
              rowKey={"id"}
              columns={columns}
              dataSource={libraries}
              pagination={false}
              onRow={(record) => {
                return {
                  onDoubleClick: () => {
                    handleGetInfo(record);
                  },
                };
              }}
            />
          </div>
          <div className="flex justify-end">
            <Pagination
              showSizeChanger
              onChange={handleChangePage}
              defaultCurrent={6}
              total={totalRecord}
            />
          </div>
        </div>
      </div>
    </>
  );
}
