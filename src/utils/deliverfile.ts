export function deliverFile(url: string, fileName: string) {
    const tg = window.Telegram?.WebApp;

    if (tg?.initData) {
        if (tg.isVersionAtLeast("8.0")) {
            tg.downloadFile({ url, file_name: fileName });
        } else {
            tg.openLink(url);
        }
        return;
    }

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
}