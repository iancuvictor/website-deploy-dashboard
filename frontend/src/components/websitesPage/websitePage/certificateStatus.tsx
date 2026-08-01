type LastCertProps = {
    lastCert: {
        authError: string | null,
        hostname: string,
        createdAt: string,
        updatedAt: string,
        issuer: {
            O: string,
            CN: string
        },
        valid: boolean,
        validFrom: string,
        validTo: string,
        websiteId: string,
        _id: string
    }
}

export default function CertificateStatus({ lastCert }: LastCertProps) {

    let daysRemaining = Math.round((new Date(lastCert.validTo).getTime() - Date.now()) / 1000 / 60 / 60 / 24)

    return <div className={`flex flex-col h-100 w-100 ring-1 ring-neutral-700 p-5`}>
        <span>Certification check frequency: <input type="text" className="w-15 outline-none ring-1 ring-neutral-700 pr-2 pl-2" /></span>
        <span><span className="text-gray-400">Organization:</span> {lastCert.issuer.O}</span>
        <span><span className="text-gray-400">Common name:</span> {lastCert.issuer.CN}</span>
        <span><span className="text-gray-400">Issue type:</span> {lastCert.authError || 'proper certification'}</span>
        <span><span className="text-gray-400">Host name:</span> {lastCert.hostname}</span>
        <span><span className="text-gray-400">Days remaining:</span> {daysRemaining > 0 && daysRemaining} {" "}
            {daysRemaining < 0 ? <span className="text-rose-500">EXPIRED</span>
                : daysRemaining > 1 ? 'days' : 'day'}</span>
                <span><span className="text-gray-400">Valid from:</span> {new Date(lastCert.validFrom).toLocaleDateString()}</span>
        <span><span className="text-gray-400">Valid till:</span> {new Date(lastCert.validTo).toLocaleDateString()}</span>
                <span><span className="text-gray-400">Valid:</span> <span className={lastCert.valid ? 'text-green-500' : 'text-rose-500'}>{String(lastCert.valid)}</span></span>
    </div>
}