#![no_std]

#[allow(unused_imports)]
use multiversx_sc::imports::*;
use multiversx_sc::derive_imports::*;

 // Struct to hold file metadata
#[type_abi]
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode, PartialEq, ManagedVecItem, Clone, Debug)]
pub struct FileMetadata<M: ManagedTypeApi> {
    file_hash: ManagedBuffer<M>,
    file_size: u64,
    file_name: ManagedBuffer<M>,
    file_type: ManagedBuffer<M>,
    file_tags: ManagedVec<M, ManagedBuffer<M>>,
    file_cid: ManagedBuffer<M>,
    timestamp: u64,
    uploader: ManagedAddress<M>,
}

impl<M: ManagedTypeApi> FileMetadata<M> {
    pub fn new(
        file_hash: ManagedBuffer<M>,
        file_size: u64,
        file_name: ManagedBuffer<M>,
        file_type: ManagedBuffer<M>,
        file_tags: ManagedVec<M, ManagedBuffer<M>>,
        file_cid: ManagedBuffer<M>,
        timestamp: u64,
        uploader: ManagedAddress<M>,
    ) -> Self {
        FileMetadata {
            file_hash,
            file_size,
            file_name,
            file_type,
            file_tags,
            file_cid,
            timestamp,
            uploader,
        }
    }
}

#[multiversx_sc::contract]
pub trait Dcsc {

    // CONTRACT STORAGE
    #[view(files)]
    #[storage_mapper("files")]
    fn files(&self) -> MapMapper<ManagedAddress, ManagedVec<FileMetadata<Self::Api>>>;

    #[view(userFiles)]
    fn user_files(&self, user_address: ManagedAddress) -> ManagedVec<FileMetadata<Self::Api>> {
        self.files().get(&user_address).unwrap_or_default()
    }

    // CONTRACT FUNCTIONS
    #[init]
    fn init(&self) {}

    #[upgrade]
    fn upgrade(&self) {}

    #[endpoint(uploadFile)]
    fn upload_file(&self,
        file_hash: ManagedBuffer<Self::Api>,
        file_size: u64,
        file_name: ManagedBuffer<Self::Api>,
        file_type: ManagedBuffer<Self::Api>,
        file_cid: ManagedBuffer<Self::Api>,
    ) {

        require!(!file_hash.is_empty(), "File hash cannot be empty.");

        require!(file_size > 0, "File size must be greater than 0.");

        require!(!file_name.is_empty(), "File name cannot be empty.");

        require!(!file_type.is_empty(), "File type cannot be empty.");

        let caller_address = self.blockchain().get_caller();
        
        let timestamp = self.blockchain().get_block_timestamp();

        // Create file metadata
        let file_metadata = FileMetadata::new(file_hash, file_size, file_name, file_type, ManagedVec::new(), file_cid, timestamp, caller_address.clone());

        // Store the file metadata
        let mut user_files = match self.files().get(&caller_address.clone()) {
            Some(existing_files) => existing_files,
            None => ManagedVec::new(),
        };

        user_files.push(file_metadata);
        self.files().insert(caller_address, user_files);
    }

    #[endpoint(removeFile)]
    fn remove_file(&self, file_cid: ManagedBuffer) {
        let caller_address = self.blockchain().get_caller();
        let owned_files = match self.files().get(&caller_address.clone()) {
            Some(current_files) => current_files,
            None => sc_panic!("File was not found!"),
        };

        for index in 0..owned_files.len() {
            let current_file_cid = owned_files.get(index).file_cid.clone();

            if current_file_cid == file_cid {
                let mut owned_files_clone = owned_files.clone();
                owned_files_clone.remove(index);
                self.files().insert(caller_address.clone(), owned_files_clone.clone());
            }
        }
    }

    #[endpoint(getUploadedFiles)]
    fn get_uploaded_files(&self) -> ManagedVec<FileMetadata<Self::Api>> {
        let caller_address = self.blockchain().get_caller();
        let user_files = match self.files().get(&caller_address) {
            Some(existing_files) => existing_files,
            None => ManagedVec::new(),
        };

        user_files
    }

    // Method to add a tag to the file
    #[endpoint(addTag)]
    fn add_tag(&self, file_cid: ManagedBuffer, tag: ManagedBuffer) {
        let caller_address = self.blockchain().get_caller();
        let owned_files = match self.files().get(&caller_address.clone()) {
            Some(current_files) => current_files,
            None => sc_panic!("File was not found!"),
        };

        for index in 0..owned_files.len() {
            let current_file_cid = owned_files.get(index).file_cid.clone();

            if current_file_cid == file_cid {
                let mut old_metadata = owned_files.get(index).clone();

                require!(!old_metadata.file_tags.contains(&tag.clone()), "This file already has this tag!");
                old_metadata.file_tags.push(tag.clone());

                let mut owned_files_clone = owned_files.clone();
                let _ = owned_files_clone.set(index, old_metadata);
                self.files().insert(caller_address.clone(), owned_files_clone.clone());

                return;
            }
        }

        sc_panic!("Something went wrong!");
    }

    #[endpoint(removeTag)]
    fn remove_tag(&self, file_cid: ManagedBuffer, tag: ManagedBuffer) {
        let caller_address = self.blockchain().get_caller();
        let owned_files = match self.files().get(&caller_address.clone()) {
            Some(current_files) => current_files,
            None => sc_panic!("File was not found!"),
        };

        for index in 0..owned_files.len() {
            let current_file_cid = owned_files.get(index).file_cid.clone();

            if current_file_cid == file_cid {
                let mut old_metadata = owned_files.get(index).clone();

                require!(old_metadata.file_tags.contains(&tag.clone()), "This tag doesn't exist for the selected file!");
                for index in 0..old_metadata.file_tags.len() {
                    let current_tag = old_metadata.file_tags.get(index).clone();
                    if current_tag == tag.clone() {
                        old_metadata.file_tags.remove(index);
                    }
                }

                let mut owned_files_clone = owned_files.clone();
                let _ = owned_files_clone.set(index, old_metadata);
                self.files().insert(caller_address.clone(), owned_files_clone.clone());

                return;
            }
        }

        sc_panic!("Something went wrong!");
    }

    // UTILITY FUNCTIONS
}
