#### 这个仓库是郑子彬老师所教区块链课程大作业使用

整个项目分两个部分：

- 服务端：server文件夹，使用nodejs sdk实现后端
- 前端：web-front文件夹，使用iview admin模版完成



接下来

- 按照 [官网教程](https://fisco-bcos-documentation.readthedocs.io/zh_CN/latest/docs/sdk/nodejs_sdk/install.html) 学习安装nodejs sdk

- 进入server（我自己下载的nodejs sdk），按照官网的指导，将证书配置路径进行修改。一直到`cli.js`可以运行，官网指导就可以结束了

- 接下来进入clis文件夹，运行指令

  ```
  node app.js
  ```

  来开启后端，结果如下：

  ![](./assets/1.png)

- 进入web-front文件夹

  运行指令

  ```
  cnpm install 或者 npm install 	//建议使用cnpm，速度很快
  cnpm run dev 或者 npm run dev		//这两个区别不大
  ```

  成功运行后，打开浏览器`localhost:8080`即可查看页面情况

  <img src="./assets/2.png" style="zoom:50%;" />

  <img src="./assets/3.png" style="zoom:50%;" />

