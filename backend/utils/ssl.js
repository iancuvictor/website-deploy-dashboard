import tls from 'tls';

export default function getSsl(url) {

    function extractHostname(url) {
        const withProtocol = url.startsWith('http') ? url : `https://${url}`;
        return new URL(withProtocol).hostname;
    }

    let sslUrl = extractHostname(url);

    return new Promise((res, rej) => {
        const socket = tls.connect(
            {
                host: sslUrl,
                port: 443,
                servername: sslUrl,
                rejectUnauthorized: false
            },
            () => {
                let certData = socket.getPeerCertificate()
                const isValid = socket.authorized;
                const authError = socket.authorizationError;
                socket.end();

                function describeAuthError(code) {
                    const map = {
                        CERT_HAS_EXPIRED: 'Expired',
                        CERT_NOT_YET_VALID: 'Not yet valid',
                        DEPTH_ZERO_SELF_SIGNED_CERT: 'Self-signed',
                        SELF_SIGNED_CERT_IN_CHAIN: 'Self-signed (in chain)',
                        UNABLE_TO_VERIFY_LEAF_SIGNATURE: 'Incomplete certificate chain',
                        HOSTNAME_MISMATCH: 'Hostname mismatch',
                        UNABLE_TO_GET_ISSUER_CERT_LOCALLY: 'Unknown issuer',
                    };
                    return map[code] || code;
                }

                const authErrorReason = describeAuthError(authError);

                if (!certData || Object.keys(certData).length === 0) {
                    return rej(new Error('No certificate returned'));
                }

                res({
                    hostname: sslUrl,
                    validFrom: new Date(certData.valid_from),
                    validTo: new Date(certData.valid_to),
                    valid: isValid,
                    authError: authErrorReason,
                    issuer: {
                        O: certData.issuer?.O,
                        CN: certData.issuer?.CN,
                    },
                });
            }
        );
        socket.on('error', rej);
    })
}