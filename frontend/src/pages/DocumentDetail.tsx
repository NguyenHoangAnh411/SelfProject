import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  TextField,
  Paper,
  Divider,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Snackbar,
  Alert,
  Select,
  FormControl,
  InputLabel,
  MenuList,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  Share as ShareIcon,
  Save as SaveIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  FormatColorText,
  FormatSize,
  History as HistoryIcon,
  Download as DownloadIcon,
  Image as ImageIcon,
  TableChart as TableIcon,
  Search as SearchIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { documentService } from '../services/api';
import { Document } from '../types';

interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  list: 'bullet' | 'ordered' | null;
  align: 'left' | 'center' | 'right';
  fontSize: string;
  color: string;
}

const styles = {
  root: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    bgcolor: '#f5f5f5',
  },
  appBar: {
    bgcolor: 'white',
    borderBottom: '1px solid #e0e0e0',
  },
  mainToolbar: {
    px: 2,
    py: 1,
  },
  titleInput: {
    '& .MuiInputBase-root': {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    '& .MuiInputBase-input': {
      py: 0.5,
    },
  },
  formatToolbar: {
    borderTop: '1px solid #e0e0e0',
    borderBottom: '1px solid #e0e0e0',
    bgcolor: '#fafafa',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  toolbarButton: {
    mx: 0.5,
    '&:hover': {
      bgcolor: 'rgba(0, 0, 0, 0.04)',
    },
  },
  editorContainer: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    p: { xs: 1, md: 3 },
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorPaper: {
    flexGrow: 1,
    mx: 'auto',
    width: '100%',
    maxWidth: '850px',
    minHeight: '500px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  editor: {
    flexGrow: 1,
    minHeight: '400px',
    background: 'white',
    borderRadius: '0 0 12px 12px',
    padding: '32px 28px',
    fontSize: '1.1rem',
    fontFamily: 'Arial, sans-serif',
    outline: 'none',
    boxShadow: 'none',
    border: 'none',
    transition: 'box-shadow 0.2s',
    '&:focus': {
      boxShadow: '0 0 0 2px #1976d2',
    },
  },
  placeholder: {
    color: '#bdbdbd',
    position: 'absolute' as const,
    pointerEvents: 'none' as const,
    left: 36,
    top: 36,
    fontSize: '1.1rem',
    fontFamily: 'Arial, sans-serif',
  },
  dialog: {
    '& .MuiDialog-paper': {
      borderRadius: '8px',
    },
  },
  dialogTitle: {
    borderBottom: '1px solid #e0e0e0',
    pb: 2,
  },
  dialogContent: {
    pt: 2,
  },
  menuItem: {
    py: 1,
    px: 2,
  },
};

const DocumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [shareAnchorEl, setShareAnchorEl] = useState<null | HTMLElement>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });
  const [historyAnchorEl, setHistoryAnchorEl] = useState<null | HTMLElement>(null);
  const [documentHistory, setDocumentHistory] = useState<Array<{ timestamp: Date; content: string }>>([]);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const [toc, setToc] = useState<Array<{ id: string; text: string; level: number }>>([]);
  const [currentHeading, setCurrentHeading] = useState('P');

  useEffect(() => {
    const fetchDocument = async () => {
      if (id) {
        try {
          const response = await documentService.getById(id);
          if (response.success && response.data) {
            setDocument(response.data);
            setContent(response.data.content || '');
            setTitle(response.data.title);
            setDocumentHistory([{
              timestamp: new Date(),
              content: response.data.content || ''
            }]);
            setTimeout(() => {
              if (editorRef.current && response.data) {
                editorRef.current.innerHTML = response.data.content || '';
                updateTOC();
              }
            }, 0);
          }
        } catch (error) {
          console.error('Error fetching document:', error);
          showSnackbar('Error loading document', 'error');
        }
      }
    };
    fetchDocument();
  }, [id]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSave = async () => {
    if (id && editorRef.current) {
      const html = editorRef.current.innerHTML;
      setContent(html);
      try {
        const response = await documentService.update(id, {
          title,
          content: html,
        });
        if (response.success) {
          showSnackbar('Document saved successfully', 'success');
          setDocumentHistory(prev => [...prev, {
            timestamp: new Date(),
            content: html
          }]);
        }
      } catch (error) {
        console.error('Error saving document:', error);
        showSnackbar('Error saving document', 'error');
      }
    }
  };

  const handleAutoSave = async () => {
    if (editorRef.current) {
      setIsSaving(true);
      setContent(editorRef.current.innerHTML);
      await handleSave();
      setIsSaving(false);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(handleAutoSave, 1500);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(handleAutoSave, 1500);
  };

  const exec = (command: string, value?: string) => {
    window.document.execCommand(command, false, value);
    handleInput();
  };

  const handleShareClick = (event: React.MouseEvent<HTMLElement>) => {
    setShareAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setShareAnchorEl(null);
  };

  const handleShareDialogOpen = () => {
    setShareDialogOpen(true);
    handleShareClose();
  };

  const handleShareDialogClose = () => {
    setShareDialogOpen(false);
    setShareEmail('');
  };

  const handleShareSubmit = async () => {
    if (id && shareEmail) {
      try {
        // TODO: Implement share functionality in the backend
        console.log('Sharing document with:', shareEmail);
        showSnackbar('Document shared successfully', 'success');
        handleShareDialogClose();
      } catch (error) {
        console.error('Error sharing document:', error);
        showSnackbar('Error sharing document', 'error');
      }
    }
  };

  const handleHistoryClick = (event: React.MouseEvent<HTMLElement>) => {
    setHistoryAnchorEl(event.currentTarget);
  };

  const handleHistoryClose = () => {
    setHistoryAnchorEl(null);
  };

  const handleHistoryVersionClick = (version: { timestamp: Date; content: string }) => {
    setContent(version.content);
    handleHistoryClose();
  };

  const handleExport = () => {
    if (typeof window !== 'undefined') {
      const element = window.document.createElement('a');
      const file = new Blob([content], {type: 'text/html'});
      element.href = URL.createObjectURL(file);
      element.download = `${title}.html`;
      window.document.body.appendChild(element);
      element.click();
      window.document.body.removeChild(element);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${title}</title>
              <style>
                body { font-family: Arial, sans-serif; }
                .content { max-width: 800px; margin: 0 auto; padding: 20px; }
              </style>
            </head>
            <body>
              <div class="content">
                <h1>${title}</h1>
                ${content}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleSearch = () => {
    if (searchText) {
      const regex = new RegExp(searchText, 'gi');
      const matches = content.match(regex);
      if (matches) {
        showSnackbar(`Found ${matches.length} matches`, 'success');
      } else {
        showSnackbar('No matches found', 'info');
      }
    }
  };

  const handleReplace = () => {
    if (searchText && replaceText) {
      const newContent = content.replace(new RegExp(searchText, 'gi'), replaceText);
      setContent(newContent);
      showSnackbar('Replace completed', 'success');
    }
  };

  const handleInsertImage = () => {
    if (imageUrl) {
      const range = window.getSelection();
      if (range) {
        const imageElement = window.document.createElement('img');
        imageElement.src = imageUrl;
        imageElement.style.cssText = 'max-width: 100%; height: auto;';
        const rangeNode = range.getRangeAt(0);
        rangeNode.deleteContents();
        rangeNode.insertNode(imageElement);
        range.removeAllRanges();
        range.addRange(rangeNode);
      }
      setImageUrl('');
      setImageDialogOpen(false);
    }
  };

  const handleInsertTable = () => {
    const range = window.getSelection();
    if (range) {
      const tableHtml = `
        <table>
          <tr><td>Table Cell 1</td><td>Table Cell 2</td><td>Table Cell 3</td></tr>
          <tr><td>Table Cell 4</td><td>Table Cell 5</td><td>Table Cell 6</td></tr>
          <tr><td>Table Cell 7</td><td>Table Cell 8</td><td>Table Cell 9</td></tr>
        </table>
      `;
      const rangeNode = range.getRangeAt(0);
      rangeNode.deleteContents();
      const fragment = window.document.createRange().createContextualFragment(tableHtml);
      rangeNode.insertNode(fragment);
      range.removeAllRanges();
      range.addRange(rangeNode);
    }
  };

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setInterval(() => {
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
        handleSave();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveTimer);
  }, [title]);

  // Thêm placeholder nếu content rỗng
  const showPlaceholder = !content || content === '<br>' || content === '<div><br></div>';

  // Cập nhật mục lục mỗi khi content thay đổi
  const updateTOC = () => {
    if (editorRef.current) {
      const headings = Array.from(editorRef.current.querySelectorAll('h1, h2, h3')) as HTMLElement[];
      const tocList = headings.map((el, idx) => {
        if (!el.id) el.id = `heading-${idx}`;
        return {
          id: el.id,
          text: el.innerText,
          level: Number(el.tagName[1]),
        };
      });
      setToc(tocList);
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      updateTOC();
    }
  }, [content]);

  const handleTocClick = (id: string) => {
    const heading = editorRef.current?.querySelector(`#${id}`);
    if (heading) {
      heading.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleHeadingChange = (e: any) => {
    const value = e.target.value.toUpperCase(); // Đảm bảo luôn là H1, H2, H3, P
    setCurrentHeading(value);
    window.document.execCommand('formatBlock', false, value);
    handleInput();
  };

  useEffect(() => {
    // Cập nhật heading khi selection thay đổi
    const updateHeading = () => {
      const val = window.document.queryCommandValue('formatBlock');
      setCurrentHeading(val?.toUpperCase() || 'P');
    };
    window.document.addEventListener('selectionchange', updateHeading);
    return () => window.document.removeEventListener('selectionchange', updateHeading);
  }, []);

  return (
    <Box sx={styles.root}>
      <AppBar position="static" elevation={0} sx={styles.appBar}>
        <Toolbar sx={styles.mainToolbar}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <TextField
              value={title}
              onChange={handleTitleChange}
              variant="standard"
              fullWidth
              sx={styles.titleInput}
              placeholder="Untitled Document"
            />
            <Typography variant="caption" sx={{ ml: 2 }}>
              {isSaving ? 'Đang lưu...' : 'Đã lưu'}
            </Typography>
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Save">
              <IconButton onClick={handleSave} color="primary" sx={styles.toolbarButton}>
                <SaveIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share">
              <IconButton onClick={handleShareClick} color="primary" sx={styles.toolbarButton}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Version History">
              <IconButton onClick={handleHistoryClick} color="primary" sx={styles.toolbarButton}>
                <HistoryIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export">
              <IconButton onClick={handleExport} color="primary" sx={styles.toolbarButton}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print">
              <IconButton onClick={handlePrint} color="primary" sx={styles.toolbarButton}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
        <Toolbar variant="dense" sx={styles.formatToolbar}>
          <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
            <Select
              value={currentHeading}
              onChange={handleHeadingChange}
              displayEmpty
            >
              <MenuItem value="P">Normal</MenuItem>
              <MenuItem value="H1">Heading 1</MenuItem>
              <MenuItem value="H2">Heading 2</MenuItem>
              <MenuItem value="H3">Heading 3</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => exec('bold')}
              color={window.document.queryCommandState('bold') ? 'primary' : 'default'}
              sx={styles.toolbarButton}
            >
              <FormatBold />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => exec('italic')}
              color={window.document.queryCommandState('italic') ? 'primary' : 'default'}
              sx={styles.toolbarButton}
            >
              <FormatItalic />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => exec('underline')}
              color={window.document.queryCommandState('underline') ? 'primary' : 'default'}
              sx={styles.toolbarButton}
            >
              <FormatUnderlined />
            </IconButton>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => exec('insertOrderedList')}
              color={window.document.queryCommandState('insertOrderedList') ? 'primary' : 'default'}
              sx={styles.toolbarButton}
            >
              <FormatListNumbered />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => exec('insertUnorderedList')}
              color={window.document.queryCommandState('insertUnorderedList') ? 'primary' : 'default'}
              sx={styles.toolbarButton}
            >
              <FormatListBulleted />
            </IconButton>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => exec('justifyLeft')}
              color={window.document.queryCommandState('justifyLeft') ? 'primary' : 'default'}
              sx={styles.toolbarButton}
            >
              <FormatAlignLeft />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => exec('justifyCenter')}
              color={window.document.queryCommandState('justifyCenter') ? 'primary' : 'default'}
              sx={styles.toolbarButton}
            >
              <FormatAlignCenter />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => exec('justifyRight')}
              color={window.document.queryCommandState('justifyRight') ? 'primary' : 'default'}
              sx={styles.toolbarButton}
            >
              <FormatAlignRight />
            </IconButton>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => exec('insertImage', imageUrl)}
              sx={styles.toolbarButton}
            >
              <ImageIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleInsertTable}
              sx={styles.toolbarButton}
            >
              <TableIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => exec('insertTable')}
              sx={styles.toolbarButton}
            >
              <TableIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => exec('find', searchText)}
              sx={styles.toolbarButton}
            >
              <SearchIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', width: '100%', maxWidth: '1100px', mx: 'auto', flexGrow: 1 }}>
        <Box sx={{ minWidth: 200, maxWidth: 250, pr: 2, display: { xs: 'none', md: 'block' } }}>
          <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#fafafa', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Mục lục</Typography>
            {toc.length === 0 && <Typography variant="body2" color="text.secondary">Không có mục lục</Typography>}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {toc.map(item => (
                <li key={item.id} style={{ marginLeft: (item.level - 1) * 16 }}>
                  <Button variant="text" size="small" onClick={() => handleTocClick(item.id)} sx={{ textTransform: 'none', color: '#1976d2' }}>
                    {item.text}
                  </Button>
                </li>
              ))}
            </ul>
          </Paper>
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Paper sx={styles.editorPaper}>
            <Box sx={{ position: 'relative', flexGrow: 1, display: 'flex' }}>
              {showPlaceholder && (
                <span style={styles.placeholder}>Start typing your document...</span>
              )}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                style={styles.editor}
                onInput={handleInput}
              />
            </Box>
          </Paper>
        </Box>
      </Box>

      <Menu
        anchorEl={shareAnchorEl}
        open={Boolean(shareAnchorEl)}
        onClose={handleShareClose}
        PaperProps={{
          sx: { borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }
        }}
      >
        <MenuItem onClick={handleShareDialogOpen} sx={styles.menuItem}>
          Share with others
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={historyAnchorEl}
        open={Boolean(historyAnchorEl)}
        onClose={handleHistoryClose}
        PaperProps={{
          sx: { borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }
        }}
      >
        <MenuList>
          {documentHistory.map((version, index) => (
            <MenuItem
              key={index}
              onClick={() => {
                if (editorRef.current) {
                  editorRef.current.innerHTML = version.content;
                }
                handleHistoryClose();
              }}
              sx={styles.menuItem}
            >
              {version.timestamp.toLocaleString()}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>

      <Dialog 
        open={shareDialogOpen} 
        onClose={handleShareDialogClose}
        sx={styles.dialog}
      >
        <DialogTitle sx={styles.dialogTitle}>Share Document</DialogTitle>
        <DialogContent sx={styles.dialogContent}>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleShareDialogClose}>Cancel</Button>
          <Button onClick={handleShareSubmit} variant="contained">
            Share
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={searchDialogOpen} 
        onClose={() => setSearchDialogOpen(false)}
        sx={styles.dialog}
      >
        <DialogTitle sx={styles.dialogTitle}>Find and Replace</DialogTitle>
        <DialogContent sx={styles.dialogContent}>
          <TextField
            autoFocus
            margin="dense"
            label="Find"
            fullWidth
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Replace with"
            fullWidth
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSearchDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSearch}>Find</Button>
          <Button onClick={handleReplace} variant="contained">
            Replace
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={imageDialogOpen} 
        onClose={() => setImageDialogOpen(false)}
        sx={styles.dialog}
      >
        <DialogTitle sx={styles.dialogTitle}>Insert Image</DialogTitle>
        <DialogContent sx={styles.dialogContent}>
          <TextField
            autoFocus
            margin="dense"
            label="Image URL"
            fullWidth
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleInsertImage} variant="contained">
            Insert
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentDetail; 