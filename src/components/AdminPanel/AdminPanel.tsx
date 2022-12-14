import React, {FC, useEffect, useState} from "react";
import "./AdminPanel.css";
import {
    Button,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
    Typography,
} from "@mui/material";
import {useWeb3} from "../../Web3ModalContext";
import {
    getOwnedTokenlinks,
    getTokenlinkFactoryAddress,
    getTokenlinkFactoryBalance,
    getTokenlinkFactoryInitialAmount,
    saveTokenlinkFactoryVariable,
} from "../../services/web3Service";
import {ethers} from "ethers";
import {getAccounts, getIsAdmin, getNfts, getTokenlinks, setNfts, setTokenlinks} from "../../store/wallet";
import {useSelector} from "react-redux";
import {useAppDispatch} from "../../store";
// @ts-ignore
import Identicon from 'react-identicons';
import NftDisplay from "../NftDisplay/NftDisplay";
import {useNavigate} from "react-router-dom";
import {connectWallet} from "../../store/utils";

export interface AdminPanelProps {
    balance: string;
    setBalance: any;
    initialAmount: string;
    setInitialAmount: any;
}

const AdminPanel: FC<AdminPanelProps> = (props) => {
    const web3 = useWeb3();
    const dispatch = useAppDispatch();
    const [key, setKey] = useState("");
    const [value, setValue] = useState("");
    const [factoryAddress, setFactoryAddress] = useState("");
    const nfts = useSelector(getNfts);
    const accounts = useSelector(getAccounts);
    const tokenlinks = useSelector(getTokenlinks);
    const isAdmin = useSelector(getIsAdmin);
    let navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            await dispatch(connectWallet());
            await web3.connect();
            if (web3.signer && !isAdmin) {
                if (tokenlinks[0]) {
                    navigate(`/tokenlinks/${tokenlinks[0].address}`);
                } else if (accounts[0]) {
                    navigate(`/accounts/${accounts[0].address}`);
                }
            }
        };
        fetchData().catch(console.error);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            await dispatch(connectWallet());
            await onConnectWallet();
            if (web3.signer && !isAdmin) {
                if (tokenlinks[0]) {
                    navigate(`/tokenlinks/${tokenlinks[0].address}`);
                } else if (accounts[0]) {
                    navigate(`/accounts/${accounts[0].address}`);
                }
            }
        };
        fetchData().catch(console.error);
    }, [web3]);

    const onConnectWallet = async () => {
        if (!web3.signer || !web3.provider || !web3.account) return;
        try {
            const initialAmount = await getTokenlinkFactoryInitialAmount(web3.signer);
            props.setInitialAmount(ethers.utils.formatEther(initialAmount));
            const balance = await getTokenlinkFactoryBalance(web3.provider);
            props.setBalance(ethers.utils.formatEther(balance));
            console.log(nfts);
            dispatch(setTokenlinks(await getOwnedTokenlinks(web3.signer)));
            const factoryAddress = getTokenlinkFactoryAddress();
            setFactoryAddress(factoryAddress);
        } catch (error) {
            console.error(error);
        }
    };

    const onSaveVariable = async () => {
        if (!web3.signer || !key || !value) return;
        try {
            let result;
            if (key === "0") {
                result = await saveTokenlinkFactoryVariable(
                    key,
                    ethers.utils.parseEther(value),
                    web3.signer
                );
            } else {
                result = await saveTokenlinkFactoryVariable(key, value, web3.signer);
            }
            console.log("result", result);
            const initialAmount = await getTokenlinkFactoryInitialAmount(web3.signer);
            props.setInitialAmount(ethers.utils.formatEther(initialAmount));
        } catch (error) {
            console.error(error);
        }
    };

    const handleValueVariableChange = (event: {
        target: { value: React.SetStateAction<string> };
    }) => {
        setValue(event.target.value);
    };

    const handleKeyVariableChange = (event: SelectChangeEvent) => {
        setKey(event.target.value as string);
    };

    const removeNft = (nft: string) => {
        const newNfts = nfts.filter((oldNft) => oldNft !== nft);
        dispatch(setNfts(newNfts));
    }

    return (
        <div className="flex flex-col items-start text-white gap-3 mx-5 flex-1">
            <Typography variant="h5">Status</Typography>
            <div className={"flex flex-col items-start"}>
                <Typography variant="body1" className="green-text uppercase">
                    Connection Status
                </Typography>
                <Typography variant="body1">
                    {!!web3.account ? "True" : "False"}
                </Typography>
            </div>
            <div className={"flex flex-col items-start"}>
                <Typography variant="body1" className="green-text uppercase">
                    Wallet Address
                </Typography>
                <Typography variant="body1">{web3.account}</Typography>
            </div>
            <div className="flex w-full gap-10">
                <div className="flex flex-col items-start">
                    <Typography variant="body1" className="green-text uppercase">
                        Wallet Balance
                    </Typography>
                    <Typography variant="body1" className="uppercase">
                        {props.balance} CAM
                    </Typography>
                </div>
            </div>
            {nfts.length > 0 && (
                <Typography variant="body1" className="green-text uppercase">
                    Wallet NFTs
                </Typography>
            )}
            <div className={"flex gap-3 m-2 justify-start flex-wrap w-full"}>
                {nfts.map((nft, index) => (
                    <NftDisplay key={index} nft={nft} removeNft={removeNft} showSendButton/>
                ))}
            </div>
            <Divider className="divider" flexItem/>
            <Typography variant="h5">Tokenlinks factory</Typography>
            <div className={"flex flex-col items-start"}>
                <Typography variant="body1" className="green-text uppercase">
                    Address
                </Typography>
                <Typography variant="body1">{factoryAddress}</Typography>
            </div>
            <FormControl className='w-full'>
                <div className="flex gap-3">
                    <InputLabel sx={{color: "gray"}}>Variable</InputLabel>
                    <Select
                        sx={{
                            width: 300,
                            color: "white",
                            backgroundColor: "#1E293B",
                        }}
                        value={key}
                        label={"Variable"}
                        onChange={handleKeyVariableChange}
                        variant={"outlined"}
                    >
                        <MenuItem value={"0"}>Initial amount</MenuItem>
                    </Select>
                    <TextField
                        label="Value"
                        value={value}
                        type="number"
                        onChange={handleValueVariableChange}
                        sx={{
                            color: "white",
                            backgroundColor: "#1E293B",
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={onSaveVariable}
                        disabled={!web3.signer || !key}
                        className={'whitespace-nowrap'}
                    >
                        Save variable
                    </Button>
                </div>
            </FormControl>
            <div className="flex w-full gap-10">
                <div className="flex flex-col items-start">
                    <Typography variant="body1" className="green-text uppercase">
                        Initial Amount
                    </Typography>
                    <Typography variant="body1" className="uppercase">
                        {props.initialAmount} CAM
                    </Typography>
                </div>
                <div className="flex flex-col items-start">
                    <Typography variant="body1" className="green-text uppercase">
                        Balance
                    </Typography>
                    <Typography variant="body1" className="uppercase">
                        {props.balance} CAM
                    </Typography>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
