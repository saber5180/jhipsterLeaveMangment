package com.mycompany.myapp.service.impl;

import com.mycompany.myapp.domain.Leave;
import com.mycompany.myapp.repository.LeaveRepository;
import com.mycompany.myapp.service.LeaveService;
import com.mycompany.myapp.service.dto.LeaveDTO;
import com.mycompany.myapp.service.mapper.LeaveMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.mycompany.myapp.domain.Leave}.
 */
@Service
@Transactional
public class LeaveServiceImpl implements LeaveService {

    private static final Logger log = LoggerFactory.getLogger(LeaveServiceImpl.class);

    private final LeaveRepository leaveRepository;

    private final LeaveMapper leaveMapper;

    public LeaveServiceImpl(LeaveRepository leaveRepository, LeaveMapper leaveMapper) {
        this.leaveRepository = leaveRepository;
        this.leaveMapper = leaveMapper;
    }

    @Override
    public LeaveDTO save(LeaveDTO leaveDTO) {
        log.debug("Request to save Leave : {}", leaveDTO);
        Leave leave = leaveMapper.toEntity(leaveDTO);
        leave = leaveRepository.save(leave);
        return leaveMapper.toDto(leave);
    }

    @Override
    public LeaveDTO update(LeaveDTO leaveDTO) {
        log.debug("Request to update Leave : {}", leaveDTO);
        Leave leave = leaveMapper.toEntity(leaveDTO);
        leave = leaveRepository.save(leave);
        return leaveMapper.toDto(leave);
    }

    @Override
    public Optional<LeaveDTO> partialUpdate(LeaveDTO leaveDTO) {
        log.debug("Request to partially update Leave : {}", leaveDTO);

        return leaveRepository
            .findById(leaveDTO.getId())
            .map(existingLeave -> {
                leaveMapper.partialUpdate(existingLeave, leaveDTO);

                return existingLeave;
            })
            .map(leaveRepository::save)
            .map(leaveMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LeaveDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Leaves");
        return leaveRepository.findAll(pageable).map(leaveMapper::toDto);
    }

    public Page<LeaveDTO> findAllWithEagerRelationships(Pageable pageable) {
        return leaveRepository.findAllWithEagerRelationships(pageable).map(leaveMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<LeaveDTO> findOne(Long id) {
        log.debug("Request to get Leave : {}", id);
        return leaveRepository.findOneWithEagerRelationships(id).map(leaveMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        log.debug("Request to delete Leave : {}", id);
        leaveRepository.deleteById(id);
    }
}
