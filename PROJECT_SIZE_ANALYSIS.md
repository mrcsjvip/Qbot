# 项目大小分析报告

## 📊 项目总览
- **项目总大小**: 1.1GB
- **分析日期**: 2024-12-13

## 🔍 目录大小分布

| 目录/文件 | 大小 | 占比 |
|----------|------|------|
| `.git` (Git历史) | 417MB | 37.9% |
| `docs` | 342MB | 31.1% |
| `qbot` | 139MB | 12.6% |
| `dev` | 131MB | 11.9% |
| `pytrader` | 40MB | 3.6% |
| `pyfunds` | 25MB | 2.3% |
| 其他 | 6.4MB | 0.6% |

## ⚠️ 发现的无用/可优化文件

### 1. **dev目录下的wheel文件** (131MB) ⭐⭐⭐
**位置**: `dev/*.whl`  
**问题**: Python wheel包文件不应该提交到Git仓库  
**文件列表**:
- `wxPython-4.2.1-cp39-cp39-macosx_10_10_universal2.whl` (30MB)
- `wxPython-4.2.1-cp38-cp38-macosx_11_0_universal2.whl` (30MB)
- `wxPython-4.2.1-cp39-cp39-win_amd64.whl` (17MB)
- `wxPython-4.2.1-cp38-cp38-win_amd64.whl` (17MB)
- `wxPython-4.2.1-cp39-cp39-win32.whl` (15MB)
- `wxPython-4.2.1-cp38-cp38-win32.whl` (15MB)
- `TA_Lib-0.4.28-cp38-cp38-linux_x86_64.whl` (3.8MB)
- 其他TA_Lib和wxPython的wheel文件

**建议**: 
- 将这些文件添加到 `.gitignore`
- 从Git历史中移除（使用 `git filter-branch` 或 `git filter-repo`）
- 使用 `requirements.txt` 或 `environment.yaml` 管理依赖

### 2. **docs/tutorials_code目录下的CSV文件** (314MB) ⭐⭐⭐
**位置**: `docs/tutorials_code/`  
**问题**: 包含3008个CSV数据文件，占用大量空间  
**大小**: 314MB

**建议**:
- 如果这些是示例数据，考虑：
  - 使用Git LFS存储
  - 压缩后存储
  - 移动到外部存储（如OSS、S3）
  - 或者从仓库中移除，改为运行时下载

### 3. **二进制可执行文件** (86MB) ⭐⭐
**位置**: 
- `qbot/plugins/investool/investool` (52MB) - Linux ELF可执行文件
- `pytrader/easytrader/utils/base.exe` (34MB) - Windows可执行文件

**问题**: 二进制文件不应该直接提交到Git仓库

**建议**:
- 使用Git LFS存储
- 或者从仓库中移除，改为构建时生成或从CI/CD下载

### 4. **Git历史中的大文件** (405MB) ⭐⭐
**位置**: `.git/objects/pack/pack-*.pack`  
**问题**: Git历史中包含了大量大文件（wheel文件、二进制文件等）

**建议**:
- 使用 `git filter-repo` 或 `BFG Repo-Cleaner` 清理历史
- 移除历史中的wheel文件和二进制文件
- 这将显著减小仓库大小

### 5. **docs/notebook目录** (14MB) ⭐
**位置**: `docs/notebook/`  
**问题**: Jupyter notebook文件可能包含输出数据

**建议**:
- 清理notebook中的输出数据（使用 `nbstripout`）
- 检查是否有不必要的输出图片或数据

### 6. **其他大文件**
- `qbot/plugins/investool/statics/font/exportor.ttf` (11MB) - 字体文件
- `qbot/plugins/investool/misc/pics/gin_arch.png` (10MB) - 图片文件
- `docs/notebook/choose_stock.ipynb` (5MB) - 可能包含大量输出数据
- `docs/tutorials_code/15.rl_learning/font/wqy-microhei.ttc` (5MB) - 字体文件

## 📋 优化建议总结

### 立即执行（可节省约500MB+）
1. **移除dev目录下的wheel文件** (131MB)
   ```bash
   # 添加到.gitignore
   echo "dev/*.whl" >> .gitignore
   # 从Git中移除
   git rm dev/*.whl
   ```

2. **处理docs/tutorials_code下的CSV文件** (314MB)
   - 如果不需要版本控制，添加到.gitignore
   - 如果需要，考虑使用Git LFS

3. **处理二进制文件** (86MB)
   - 使用Git LFS或从仓库移除

### 中期优化（可节省约400MB+）
4. **清理Git历史**
   - 使用 `git filter-repo` 移除历史中的大文件
   - 这将减小 `.git` 目录大小

### 长期维护
5. **建立文件管理规范**
   - 大文件（>10MB）使用Git LFS
   - 二进制文件不直接提交
   - 依赖包通过包管理器管理

## 🎯 预期优化效果

| 优化项 | 预计节省空间 |
|--------|------------|
| 移除wheel文件 | ~131MB |
| 处理CSV文件 | ~314MB |
| 处理二进制文件 | ~86MB |
| 清理Git历史 | ~400MB |
| **总计** | **~931MB** |

优化后项目大小预计可降至 **~200MB** 左右。

## ⚠️ 注意事项

1. **清理Git历史前**：
   - 确保所有团队成员都已同步最新代码
   - 创建备份分支
   - 通知团队成员需要重新克隆仓库

2. **移除文件前**：
   - 确认文件确实不需要版本控制
   - 考虑是否需要保留在外部存储

3. **使用Git LFS**：
   - 需要配置Git LFS
   - 团队成员需要安装Git LFS客户端

