import axios from './axios.config.js'

function upload(path, userForm, method = 'post') {
    const formData = new FormData()
    for (let i in userForm) {
        if (i === 'file') continue
        formData.append(i, userForm[i])
    }
    if (userForm.file) {
        formData.append('file', userForm.file)
    }
    const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
    }
    if (method === 'put') {
        return axios.put(path, formData, config).then(res => res.data)
    }
    return axios.post(path, formData, config).then(res => res.data)
}

export default upload
